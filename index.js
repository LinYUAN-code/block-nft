const Koa = require("koa")
const Router = require("koa-router")
const KoaStatic = require("koa-static")
const fs = require("fs");
const path = require("path")
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('dapp')
const initDB = require("./createDb")
const bodyparser = require("koa-bodyparser");
const {createUser, transfer} = require("./caller")

initDB();

const app = new Koa();

app.use(KoaStatic("./static"));
app.use(bodyparser());

const router = new Router();

router.get("/",(ctx)=>{
    const html = fs.readFileSync(path.join(__dirname,"/templates/index.html"));
    ctx.response.type = "html";
    ctx.body = html;
})
router.post("/login",async (ctx)=>{
    const name = ctx.request.body.name;
    const pwd = ctx.request.body.pwd;
    await new Promise((r)=>{
        db.all(`
            SELECT * FROM user 
            WHERE name = "${name}"
        `,(err,res)=>{ 
            r();
            console.log(err,res);
            if(err || res.length!=1) {
                ctx.body = "-1";
                return ;
            }
            const user = res[0];
            if(user.pwd !== pwd) {
                ctx.body = "-1";
                return ;
            }
            ctx.body = {
                name,
                pwd,
                assets: user.assets
            };
        })
    })

})
router.post("/registe",async (ctx)=>{
    const name = ctx.request.body.name;
    const pwd = ctx.request.body.pwd;
    // 先在合约里面创建一个用户
    createUser(name,0);
    await new Promise((r)=>{
        db.all(`
            SELECT * FROM user 
            WHERE name = "${name}";
        `,async (err,res)=>{ 
            console.log("创建用户:",err,res);
            if(res.length!=0) {
                ctx.body =  "用户已存在";
                r();
                return ;
            }
            await new Promise(()=>{
                db.run(`
                    INSERT INTO user (name,pwd,assets) VALUES 
                    ("${name}","${pwd}",0);
                `,(err)=>{
                    if(err) {
                        r();
                        ctx.body = "创建失败";
                        return ;
                    }
                    ctx.body = {
                        name,
                        pwd,
                        assets: 0,
                    };
                    r();
                })
            });
        })
    })
})
router.post("/add",(ctx)=>{
    ctx.body = "200";
})

function getUserByName(name) {
    return new Promise((r)=>[
        db.all(`
            SELECT * FROM user
            WHERE name = "${name}"
        `,(err,res)=>{
            if(err) {
                console.log(res);
            }
            r(res[0]);
        })
    ]);
}

router.post("/transfer",async (ctx)=>{
    const fromName = ctx.request.body.fName;
    const toName = ctx.request.body.tName;
    const amount = parseInt(ctx.request.body.amount);
    console.log(fromName,toName,amount);
    // 操作合约
    transfer(fromName,toName,amount);


    // 修改数据库
    let fUser = await getUserByName(fromName);
    let tUser = await getUserByName(toName);
    console.log(fUser,tUser);

    await new Promise((r)=>{
        db.run(`
            UPDATE user
            SET assets = ${fUser.assets - amount}
            WHERE name = "${fromName}"
        `,()=>{
            r();
        })
    });

    await new Promise((r)=>{
        db.run(`
            UPDATE user
            SET assets = ${tUser.assets + amount}
            WHERE name = "${toName}"
        `,()=>{
            r();
        })
    })
    ctx.body = "转账成功";
});
app.use(router.routes())
app.use(router.allowedMethods());
app.use((ctx)=>{
    ctx.status = 404;
    ctx.body = "404 接口不存在";
})


app.listen(7898,()=>{
    console.log(`服务器启动于: http://127.0.0.1:7898`);
})
