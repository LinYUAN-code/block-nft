#![cfg_attr(not(feature = "std"), no_std)]

use liquid::storage;
use liquid_lang as liquid;

#[liquid::contract]
mod lrj_contract {
    use super::*;
    
    type Balance = u128;    


    #[liquid(storage)]
    struct LRJ {  
        // 限定了这个货币总共有多少
        pub total_money: storage::Value<Balance>,
        // 合约部署者=。= lrj
        creater: storage::Value<String>,
        // 每一个地址对应着一个值
        balances: storage::Mapping<Address, Balance>,
        // 把你的钱允许给其他人花---相当于支票
        check: storage::Mapping<(Address, Address), Balance>,
        // offer_id  --> 购买人地址 价格 craft_id craft拥有者 交易状态
        offer: storage::Mapping<u128,(Address,u128,String,Address,String)>,
        // craft_id -->  时间戳以及拥有者地址
        craft: storage::Mapping<String,Vec<(u128,String)>>,
        // 记录目前和craft_id相关的状态为open 的 offer_id
        craft_offer: storage::Mapping<String,Vec<u128>>
    }

    #[liquid(methods)]
    impl LRJ {
        pub fn new(&mut self, initial_supply: Balance)  {
            // 给合约部署者一个初始的钱
            // 初始化各种容器
            let caller = self.env().get_caller();
            self.total_money.initialize(initial_supply);
            self.balances.initialize();
            self.balances.insert(caller.clone(), initial_supply);
            self.check.initialize();
            self.offer.initialize();
            self.craft_offer.initialize();
            self.craft.initialize();
            let signature_string: String = self.address_to_string(caller);
            self.creater.initialize(signature_string)
        }
        // liquid javaSDK传参 好像有点问题--只能传string？
        fn string_to_u128(&self,s: String) -> u128 {
            let mut ans: u128 = 0;
            for elem in s.as_bytes() {
                ans = ans*10 + (*elem as u128) - 48;
            }
            ans
        }

        // 用于测试JDK传参
        pub fn test_multi(&mut self,a:String,b:String,c:String,d:String) -> (String,String,u128,String) {
            let rc = self.string_to_u128(c);
            (a,b,rc,d)
        }

        pub fn get_current_address(&mut self) -> String {
            self.address_to_string(self.env().get_caller())
        }
        fn address_to_string(&mut self,add: Address) -> String {
            let a: Vec<u8> = add.as_bytes().to_vec();
            String::from_utf8(a).unwrap()
        }

        pub fn get_craft_owner(&mut self,craft_id: String) -> String {
            let arr = self.craft.get(&craft_id.clone()).unwrap();
            // 取出当前的拥有者
            // 注意所有权问题
            (*arr.get(arr.len()-1).unwrap()).clone().1
        }
        
        // 合约返回值不能是数组--所以这个方法没用
        pub fn get_craft_history(&mut self,craft_id: String) -> Vec<(u128,String)> {
            (*self.craft.get(&craft_id).unwrap()).clone()
        }

        // 创建一个新的
        pub fn create_craft(&mut self,craft_id: String,owner: String,stime: String) -> bool {
            let time = self.string_to_u128(stime);
            let oarr = self.craft.get(&craft_id.clone());
            if oarr != None {
                return false;
            }
            let mut arr = Vec::new();
            arr.push((time.clone(),owner.clone()));
            self.craft.insert(craft_id.clone(), arr);
            true
        }

        // 创建一个购买offer
        pub fn make_offe(&mut self,soffer_id: String,to: Address,craft_id: String,sprice: String) -> bool {
            let offer_id = self.string_to_u128(soffer_id);
            let price =  self.string_to_u128(sprice);
            let from = self.env().get_caller();

            // 暂时把你的钱给lrj管理
            let creater: Address = String::from(self.get_creater()).into();
            self.transfer_from_to(from.clone(), creater.clone(), price.clone());
            
            // 插入一个offer
            self.offer.insert(offer_id.clone(), (from.clone(),price.clone(),craft_id.clone(),to.clone(),String::from("open")));
            // 对应craft_id 的offer增加
            let back_arr = Vec::new();
            let mut arr = (*self.craft_offer.get(&craft_id.clone()).unwrap_or(&back_arr)).clone();
            arr.push(offer_id.clone());
            self.craft_offer.insert(craft_id.clone(), arr.clone());
            true
        }

        // 接受一个购买offer--同时拒绝所有其他的offer
        pub fn acc_offer(&mut self,soffer_id: String,stime: String) -> bool {
            let offer_id = self.string_to_u128(soffer_id);
            let time = self.string_to_u128(stime);
            
            // 修改offer记录 状态为 完成
            let mut offer = (*self.offer.get(&offer_id.clone()).unwrap()).clone();
            // 如果这个offer已经是被关闭的
            if !offer.4.eq("open") {
                return false;
            }

            offer.4 = String::from("finish");
            self.offer.insert(offer_id.clone(), offer.clone());
            
            let craft_id = offer.2.clone();

            // 修改金额
            let to = offer.3;
            let price = offer.1;
            let creater: Address = String::from(self.get_creater()).into();
            self.transfer_from_to(creater, to, price);
            

            // 关闭所有与craft相关的状体
            let arr = (*self.craft_offer.get(&craft_id.clone()).unwrap()).clone();
            for elem in arr {
                if elem == offer_id {
                    continue;
                }
                self.i_reject_offer(elem);
            }
            // 清空
            self.craft_offer.insert(craft_id.clone(), Vec::new());


            // 更新craft所有权--也就是插入一条新的记录
            let mut arr = (*self.craft.get(&craft_id.clone()).unwrap()).clone();
            arr.push((time,self.address_to_string(offer.0)));
            self.craft.insert(craft_id.clone(), arr);
            true
        }

        fn change_offer_status(& mut self,offer_id: u128,status: String) -> bool {
            let mut offer = (*self.offer.get(&offer_id.clone()).unwrap()).clone();
            offer.4 = String::from(status);
            self.offer.insert(offer_id, offer);
            true
        }

        pub fn reject_offer(&mut self,soffer_id: String) -> bool {
            let offer_id = self.string_to_u128(soffer_id);

            self.i_reject_offer(offer_id)
        }

        fn i_reject_offer(&mut self,offer_id: u128) -> bool  {
            let offer = (*self.offer.get(&offer_id.clone()).unwrap()).clone();
            if !offer.4.eq("open") {
                return false;
            }

            self.change_offer_status(offer_id.clone(), String::from("close"));
            
            // 退还钱给from
            let creater: Address = String::from(self.get_creater()).into();
            self.transfer_from_to(creater, offer.0, offer.1);

            true  
        }

        // 获取全部金额
        pub fn get_total_money(&mut self) -> Balance {
            *self.total_money.get()
        }
        
        // 获取创建者地址
        pub fn get_creater(&mut self) -> String {
            String::from(self.creater.get())
        }

        pub fn balance_of(&self, owner: Address) -> Balance {
            self.balance_of_or_zero(&owner)
        }

        // 查询owner 允许花 spender 多少钱
        pub fn allowance(&self, owner: Address, spender: Address) -> Balance {
            self.allowance_of_or_zero(&owner, &spender)
        }

        pub fn transfer(&mut self, to: Address, svalue: String) -> bool {
            let value = self.string_to_u128(svalue);
            let from = self.env().get_caller();
            self.transfer_from_to(from, to.clone(), value.clone())
        }

        pub fn approve(&mut self, spender: Address, svalue: String) -> bool {
            let value = self.string_to_u128(svalue);
            let owner = self.env().get_caller();
            self.check
                .insert((owner.clone(), spender.clone()), value);
            true
        }

        pub fn transfer_from(
            &mut self,
            from: Address,
            to: Address,
            svalue: String,
        ) -> bool {
            let value = self.string_to_u128(svalue);

            let caller = self.env().get_caller();
            let allowance = self.allowance_of_or_zero(&from, &caller);
            if allowance < value {
                return false;
            }

            self.check
                .insert((from.clone(), caller.clone()), allowance - value);
            self.transfer_from_to(from, to, value)
        }

        pub fn get_balance_of(&self) -> Balance {
            self.balance_of_or_zero(&self.env().get_caller())
        }

        fn balance_of_or_zero(&self, owner: &Address) -> Balance {
            *self.balances.get(owner).unwrap_or(&0)
        }

        fn allowance_of_or_zero(&self, owner: &Address, spender: &Address) -> Balance {
            *self
                .check
                .get(&(owner.clone(), spender.clone()))
                .unwrap_or(&0)
        }

        fn transfer_from_to(
            &mut self,
            from: Address,
            to: Address,
            value: Balance,
        ) -> bool {
            let from_balance = self.balance_of_or_zero(&from.clone());
            // 如果转账者钱不够
            if from_balance < value { 
                return false;
            }
            self.balances.insert(from.clone(), from_balance - value);
            let to_balance = self.balance_of_or_zero(&to.clone());
            self.balances.insert(to.clone(), to_balance + value);
            true
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use liquid::env::test;

        #[test]
        fn new_works() {
            let accounts = test::default_accounts();
            let alice = accounts.alice;

            test::set_caller(alice);
            let contract = LRJ::new(100);
            assert_eq!(contract.total_money, 100);
            assert_eq!(contract.balances.len(), 1);
            assert_eq!(contract.check.len(), 0);
        }

        #[test]
        fn balance_of_works() {
            let accounts = test::default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;

            test::set_caller(alice.clone());
            let contract = LRJ::new(100);
            assert_eq!(contract.balance_of(alice.clone()), 100);
            assert_eq!(contract.balance_of(bob.clone()), 0);
        }

        #[test]
        fn transfer_works() {
            let accounts = test::default_accounts();
            let alice = accounts.alice;
            let bob = accounts.bob;

            test::set_caller(alice.clone());
            let mut contract = LRJ::new(100);

            assert_eq!(contract.balance_of(bob.clone()), 0);
            assert_eq!(contract.transfer(bob.clone(), String::from("10")), true);

            assert_eq!(contract.balance_of(bob.clone()), 10);
            assert_eq!(contract.balance_of(alice.clone()), 90);
        }


        // 测试craft相关功能
        #[test]
        fn craft_works() {
            let accounts = test::default_accounts();
            let alice = accounts.alice;
            let eve = accounts.eve;
            let bob = accounts.bob;
            let frank = accounts.frank;

            let alice_addr = String::from_utf8(alice.as_bytes().to_vec()).unwrap();
            let bob_addr = String::from_utf8(bob.as_bytes().to_vec()).unwrap();

            test::set_caller(eve.clone());
            let mut contract = LRJ::new(1000);
            contract.transfer(alice.clone(),String::from("200"));
            contract.transfer(frank.clone(),String::from("200"));
            assert_eq!(contract.balance_of(alice.clone()),200);

            
            assert_eq!(contract.create_craft(String::from("206874f05f05fd2a1d6503d96441dcf634b207ca3815125ac93903c6e83d1213"),bob_addr.clone(),String::from("123455")),true);


            test::set_caller(alice.clone());
            assert_eq!(contract.get_craft_owner(String::from("206874f05f05fd2a1d6503d96441dcf634b207ca3815125ac93903c6e83d1213")),bob_addr.clone());

        
            contract.make_offe(String::from("1"),bob.clone(),String::from("206874f05f05fd2a1d6503d96441dcf634b207ca3815125ac93903c6e83d1213"),String::from("100"));


            test::set_caller(frank.clone());
            contract.make_offe(String::from("2"),bob.clone(),String::from("206874f05f05fd2a1d6503d96441dcf634b207ca3815125ac93903c6e83d1213"),String::from("100"));


            println!("{}",contract.balance_of(alice.clone()));
            assert_eq!(contract.balance_of(alice.clone()),100);
            assert_eq!(contract.balance_of(frank.clone()),100);
            assert_eq!(contract.balance_of(eve.clone()),800);
            assert_eq!(contract.balance_of(bob.clone()),0);

            
            test::set_caller(bob.clone());
            contract.acc_offer(String::from("1"),String::from("222222"));

            assert_eq!(contract.get_craft_owner(String::from("206874f05f05fd2a1d6503d96441dcf634b207ca3815125ac93903c6e83d1213")),alice_addr.clone());
            assert_eq!(contract.balance_of(alice.clone()),100);
            assert_eq!(contract.balance_of(frank.clone()),200);
            assert_eq!(contract.balance_of(bob.clone()),100);

            assert_eq!(contract.get_craft_history(String::from("206874f05f05fd2a1d6503d96441dcf634b207ca3815125ac93903c6e83d1213")).len(),2);
            assert_eq!(contract.acc_offer(String::from("1"),String::from("222222")),false);
        }
    }
}


// cargo test
// cargo liquid build --skip-analysis
