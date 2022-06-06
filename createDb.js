const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('dapp');
const {createUser} = require("./caller")


module.exports = function initDB() {
    db.run(`CREATE TABLE IF NOT EXISTS user (
        name TEXT PRIMARY KEY,
        pwd  TEXT,
        assets INT DEFAULT 0
    );`);

    db.all(`
        SELECT * FROM user 
        WHERE name = "lin"
    `,(err,res)=>{
        if(!res || !res.length) { //创建超级用户
            db.run(`
                INSERT INTO user (name,pwd,assets) VALUES 
                ("lin","123456",110000);
            `)
            // createUser("lin",110000);
        }
    })
}