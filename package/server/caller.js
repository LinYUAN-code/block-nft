const request = require("request");
// const cmd = require("node-cmd")

// module.exports.createUser =  function createUser(name,amount) {
//     process.chdir("./dist");
//     let result = cmd.runSync(`bash ./asset_run.sh register ${name} ${amount}`);
//     console.log(result);
//     process.chdir("./..");
// }

// module.exports.transfer =  function transfer(fName,tName,amount) {
//     process.chdir("./dist");
//     let result  = cmd.runSync(`bash ./asset_run.sh transfer  ${fName}  ${tName} ${amount}`)
//     console.log(result);
//     process.chdir("./..");
// }
const SPRING_BOOT_ADDR = "http://localhost:8080";

function arequest(options) {
    return new Promise((r)=>{
        request.post(options,(error,response,body)=> {
            if(error) {
                r(-1);
            } else {
                r(body);
            }
        })
    })
}

module.exports.createAccount = async function createAccount() {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/createAccount",
    });
}

module.exports.loadAccount = async function loadAccount(address) {
    address = "0x" + address;
    return await arequest({
        url: SPRING_BOOT_ADDR + "/loadAccount",
        form: {
            address,
        }
    });
}

module.exports.getCurrentAddress = async function getCurrentAddress()  {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/getCurrentAccount",
    });
}

module.exports.getBalance = async function getBalance() {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/getBalance",
    });
}

module.exports.transfer = async function transfer(to,amount) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/transfer",
        form: {
            to,amount,
        }
    })
}

module.exports.testMulti = async function testMulti(a,b,c,d) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/test",
        form: {
            a,b,c,d
        }
    })
}

module.exports.getCraftOwner = async function getCraftOwner(craftId) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/getCraftOwner",
        form: {
            craftId,
        }
    })
}

module.exports.createCraft = async function createCraft(craftId,owner,time) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/createCraft",
        form: {
            craftId,owner,time
        }
    })
}

module.exports.makeOffer = async function makeOffer(offer_id,to,craft_id,price) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/makeOffer",
        form: {
            offer_id,to,craft_id,price
        }
    })
}

module.exports.accOffer = async function accOffer(offer_id,time) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/accOffer",
        form: {
            offer_id,time
        }
    })
}

module.exports.rejectOffer = async function rejectOffer(offer_id) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/rejectOffer",
        form: {
            offer_id
        }
    })
}


module.exports.getCraftHistory = async function getCraftHistory(craft_id) {
    return await arequest({
        url: SPRING_BOOT_ADDR + "/getCraftHistory",
        form: {
            craft_id
        }
    });
}


async function test() {
    let addr = await module.exports.createAccount();
    console.log(addr);
    let loadAddr = await module.exports.loadAccount(addr);
    console.log(loadAddr);
    let currentAddr = await module.exports.getCurrentAddress();
    console.log(currentAddr);
    let balance  = await module.exports.getBalance();
    console.log(balance);
    let res = await module.exports.loadAccount("0xeb2177878c4a515ba96bd112f457bf559d882553");
    console.log(res);
    balance = await module.exports.getBalance();
    console.log(balance);
}

async function testTransfer() {
    let res = await module.exports.loadAccount("0xeb2177878c4a515ba96bd112f457bf559d882553");
    console.log(res);
    res = await module.exports.getBalance();
    console.log(res);
    res = await module.exports.transfer("95de147161c0fd8e121cd16f702030b11fe1b583","100");
    console.log(res); 
    res = await module.exports.loadAccount("0x95de147161c0fd8e121cd16f702030b11fe1b583");
    console.log(res);
    res = await module.exports.getBalance();
    console.log(res); //100
    await module.exports.loadAccount("0xeb2177878c4a515ba96bd112f457bf559d882553");
    res = await module.exports.getBalance();
    console.log(res);
}

async function testMulti() {
    let res = await module.exports.testMulti("1","2","3231233","44");
    console.log(res);
}


// test();
// testTransfer();
// testMulti();




