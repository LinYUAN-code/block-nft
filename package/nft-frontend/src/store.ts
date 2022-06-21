import React, { useEffect, useReducer, useState } from "react";
import { httpLogin } from "./apis";

let user:User = {
    "name": '',
    "assets": 0,
    "tocken": '',
    "address": "",
    "pwd": "",
};
let routerParam:any = {
    
}

const handler = {
    get(target:any,key:any) {
        return target[key];
    },
    set(target:any,key:any,val:any,receiver:any):any {
        const result = Reflect.set(target, key, val, receiver);
        console.log(target,key,val);
        target[key] = val;
        console.log("set! 更新依赖");
        console.log("放入sessionStorage:",key);
        sessionStorage.setItem(key,JSON.stringify(val));
        for(let x of dep) {
            x();
        }
        return result;
    }
}
// proxy 不会监听深层对象喔--
const _store: any = new Proxy({
    user,
    routerParam,
},handler);
 
async function initUser() {
    console.log("initUser");
    let suser = sessionStorage.getItem("user");
    if(suser) {
        let user:User = JSON.parse(suser);
        let res = await httpLogin({
            name: user.name,
            pwd: user.pwd
        });
        console.log(res);
        _store.user = res;
    }
}

// init路由参数
function initParam() {
    let srouterParam = sessionStorage.getItem("routerParam");
    if(srouterParam) {
        let routerParam = JSON.parse(srouterParam);
        _store.routerParam = routerParam;
    }
}

const dep:any[] = [];


function useStore() {
    // 注意这里使用useReducer才可以---要是使用useState会无法更新--useState必须要在对应组件内调用才会有效
    const [, forceRender] = useReducer(s => s + 1, 0)
    // 注册
    useEffect(()=>{
        const updater = () => {
            forceRender();
        }
        dep.push(updater);
        return ()=>{
            dep.forEach((v,index)=>{
                if(v===updater) {
                    dep.splice(index,1);
                }
            })
        }
    },[]);

    return _store;
}

function getStore() {
    return _store;
}

function init() {
    initUser();
    initParam();
}

init();

export  {
    useStore,
    getStore,
}
