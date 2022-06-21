const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dapp');
const {createUser} = require("./caller")


module.exports = function initDB() {
    db.run(`
        CREATE TABLE IF NOT EXISTS user (
            name TEXT PRIMARY KEY,
            pwd  TEXT,
            assets INT DEFAULT 0,
            address TEXT
        );
    `);
    // 可以通过id去查找区块链中相关的数据--url是服务器保存文件位置
    // craft_id 中保存着照片sha256之后的结果
    db.run(`
        CREATE TABLE IF NOT EXISTS craft (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            owner TEXT,
            url TEXT, 
            time INT,
            likes INT,
            dislikes INT,
            craft_id TEXT
        );
    `);
    
    // 用来记录craft 所有权历史
    db.run(`
        CREATE TABLE IF NOT EXISTS craft_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            craftId INTEGER,
            owner TEXT,
            time INTEGER
        );
    `);
    // STATUS 表示交易状态
    db.run(`
        CREATE TABLE IF NOT EXISTS offer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fromName TEXT,
            toName TEXT,
            intro TEXT,
            craftId INTEGER,
            price INTEGER,
            status TEXT
        );
    `)
    db.all(`
        SELECT * FROM user 
        WHERE name = "lin"
    `,(err,res)=>{
        if(!res || !res.length) { //创建超级用户
            db.run(`
                INSERT INTO user (name,pwd,assets,address) VALUES 
                ("lin","123456",100000,"eb2177878c4a515ba96bd112f457bf559d882553");
            `)
        }
    })
}