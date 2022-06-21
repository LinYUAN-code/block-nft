const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('dapp')
const fs = require("fs");
const crypto = require("crypto");

function getFileType(s) {
    let arr = s.split(".");
    return arr[arr.length-1];
}


function dbAll(sql,cb) {
    return new Promise((r)=>{
        db.all(sql,(err,rows)=>{
            if(cb && typeof cb === "function") {
                cb(err,rows);
            }
            r();
        })
    })
}

function dbRun(sql,cb) {
    return new Promise((r)=>{
        db.run(sql,(err)=>{
            if(cb && typeof cb === "function") {
                cb(err);
            }
            r();
        })
    })
}

function getFileSha25(filePath) {
    return new Promise((resolve,reject)=>{   
        if(!fs.existsSync(filePath)) {
            reject("file does not exist");
            return ;
        }
        let stream = fs.createReadStream(filePath);
        let hash = crypto.createHash("sha256");

        stream.on('data',(data) => {
            hash.update(data);
        })

        stream.on("end",()=>{
            let ans = hash.digest("hex");
            resolve(ans);
        })
        stream.on("error",(err)=>{
            reject(err);
        })
    })
}

module.exports = {
    getFileType,
    dbRun,
    dbAll,
    getFileSha25,
}