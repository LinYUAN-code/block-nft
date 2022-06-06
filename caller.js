const cmd = require("node-cmd")


module.exports.createUser =  function createUser(name,amount) {
    process.chdir("./dist");
    let result = cmd.runSync(`bash ./asset_run.sh register ${name} ${amount}`);
    console.log(result);
    process.chdir("./..");
}

module.exports.transfer =  function transfer(fName,tName,amount) {
    process.chdir("./dist");
    let result  = cmd.runSync(`bash ./asset_run.sh transfer  ${fName}  ${tName} ${amount}`)
    console.log(result);
    process.chdir("./..");
}



