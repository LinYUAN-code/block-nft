const Koa = require("koa")
const Router = require("koa-router")
const KoaStatic = require("koa-static")
const fs = require("fs");
const path = require("path")
const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('dapp')
const initDB = require("./createDb")
const {createUser, transfer, createAccount, getBalance, loadAccount, makeOffer, accOffer, getCraftHistory, rejectOffer} = require("./caller")
const Cors = require("koa-cors");
const KoaBody = require("koa-body");
const { getFileType, dbAll, dbRun, getFileSha25 } = require("./utils");
initDB();

const app = new Koa();
const BASE_ADDR = "http://110.64.88.38:7898";


app.use(Cors());
app.use(KoaStatic("tmp"));
app.use(KoaBody({
    multipart: true,
    strict: false,
    patchNode: true,
    formidable: {
        keepExtensions: true,
        maxFileSize: 20 * 1024 * 1024    // 设置上传文件大小最大限制，最大为20mb
    }
}));

const router = new Router();

router.get("/",(ctx)=>{
    const html = fs.readFileSync(path.join(__dirname,"/templates/index.html"));
    ctx.response.type = "html";
    ctx.body = html;
})
router.post("/login",async (ctx)=>{
    const name = ctx.request.body.name;
    const pwd = ctx.request.body.pwd;
    let user;
    await dbAll(`
        SELECT * FROM user 
        WHERE name = "${name}"
    `,(err,rows)=>{
        if(err || !rows || rows.length!=1) {
            ctx.body = "-1";
            return ;
        }
        user = rows[0];
    })
    if(user.pwd !== pwd) {
        ctx.body = "-1";
        return ;
    }
    await loadAccount(user.address);
    let balance = await getBalance();
    balance = parseInt(balance);
    if(balance !== user.assets) {
        ctx.body = "检验balance失败";
        return ;
    }
    ctx.body = {
        name,
        pwd,
        address: user.address,
        assets: user.assets,
    };
})
router.post("/registe",async (ctx)=>{
    const name = ctx.request.body.name;
    const pwd = ctx.request.body.pwd;


    // 先创建一个合约地址
    let address = await createAccount();


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
                    INSERT INTO user (name,pwd,assets,address) VALUES 
                    ("${name}","${pwd}",0,"${address.slice(2)}");
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
                        address: address.slice(2)
                    };
                    r();
                })
            });
        })
    })
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

router.post("/uploadCraft",async (ctx)=>{
    let id;
    await new Promise((r)=>{
        db.all(`
            SELECT id
            from craft
            where id = (select max(id) from craft);
        `,(err,rows)=>{
            if(!rows.length) {
                id = 1;
            } else {
                id = rows[0].id + 1;
            }
            r();
        })
    });
    
    const name = ctx.request.body.name;
    const owner = ctx.request.body.owner;
    const file = ctx.request.files.file;
    const url = `${BASE_ADDR}/${id}.${getFileType(file.filepath)}`;
    const fileUrl = `./tmp/${id}.${getFileType(file.filepath)}`;
    // 根据文件生成一个craft_id 利用sha256
    let craft_id = await getFileSha25(file.filepath);
    console.log(craft_id);
    let writer = fs.createWriteStream(fileUrl);
    let reader = fs.createReadStream(file.filepath);
    reader.pipe(writer);
    const time = new Date().getTime();
    // 操作合约

    // 保存到数据库
    await new Promise((r)=>{
        db.run(`
            INSERT INTO craft (id,name,owner,url,time,likes,dislikes,craft_id) VALUES 
            (${id},"${name}","${owner}","${url}",${time},${0},${0},"${craft_id}");
        `,()=>{
            r();
            ctx.body = "上传成功";
        })
    });
})

async function innerTransfer(fUser,tUser,amount) {
    const fromAddress = fUser.address;
    const toAddress = tUser.address;
    const fName = fUser.name;
    const tName = tUser.name;
    if(fUser.assets < amount) {
        return false;
    }
    console.log(fromAddress,toAddress,amount);

    // 操作合约
    let res = await loadAccount(fromAddress);
    console.log(res);
    res = await transfer(toAddress,amount);
    console.log(res);

    // 修改数据库
    await dbRun(`
        UPDATE user
        SET assets = ${fUser.assets - amount}
        WHERE name = "${fName}"
    `,(err)=>{
        if(err) {
            console.log(err);
        }
    });

    await dbRun(`
        UPDATE user
        SET assets = ${tUser.assets + amount}
        WHERE name = "${tName}"
    `,(err)=>{
        if(err) {
            console.log(err);
        }
    })

    return true;
}

router.post("/transfer",async (ctx)=>{
    const fName = ctx.request.body.fName;
    const tName = ctx.request.body.tName;
    let fUser = await getUserByName(fName);
    let tUser = await getUserByName(tName);
    const amount = parseInt(ctx.request.body.amount);
    let res = await innerTransfer(fUser,tUser,amount);
    if(res) {
        ctx.body = "转账成功";
    } else {
        ctx.body = "-1";
    }
});


router.post("/getCraftLists",async (ctx)=>{
    await new Promise((r)=>{
        db.all(`
            SELECT *
            FROM craft
        `,(err,rows)=>{
            ctx.body = rows;
            r();
        })
    })
})


router.post("/queryCraftListsByName",async (ctx)=>{
    const pattern = ctx.request.body.pattern;    
    await new Promise((r)=>{
        db.all(`
            SELECT *
            FROM craft
            WHERE name LIKE '%${pattern}%';
        `,(err,rows)=>{
            ctx.body = rows;
            r();
        })
    })
})

router.post("/queryCraftById",async (ctx)=>{
    const id = ctx.request.body.id;
    await new Promise((r)=>{
        db.all(`
            SELECT *
            FROM craft
            WHERE id = ${id}
        `,(err,rows)=>{
            if(err) {
                console.log(err);
                r();
                return ;
            }
            ctx.body = rows[0];
            r();
        })
    })
})

router.post("/queryCraftByOwner",async (ctx)=>{
    const owner = ctx.request.body.owner;
    await new Promise((r)=>{
        db.all(`
            SELECT *
            FROM craft
            WHERE owner = "${owner}"
        `,(err,rows)=>{
            ctx.body = rows || [];
            r();
        })
    })
})


router.post("/updateLikesById", async (ctx)=>{
    const id = ctx.request.body.id;
    const likes = ctx.request.body.likes;
    const dislikes = ctx.request.body.dislikes;
    await new Promise((r)=>{
        db.run(`
            UPDATE craft
            SET likes = ${likes}, dislikes = ${dislikes} 
            WHERE id = ${id}
        `,()=>{
            ctx.body = "修改成功";
            r();
        })
    })
})


router.post("/makeAnOffer",async (ctx)=>{
    const fromName = ctx.request.body.fromName;
    const toName = ctx.request.body.toName;
    const craftId = ctx.request.body.craftId;
    const craft_id = ctx.request.body.craft_id; //哈希
    const price = ctx.request.body.price;
    const intro = ctx.request.body.intro;

    let fUser = await getUserByName(fromName);
    let tUser = await getUserByName(toName);
    if(fUser.assets < price) {
        return ;
    }
    //status: open finish close
    await dbRun(`
        INSERT INTO offer (fromName,toName,intro,craftId,price,status) VALUES 
        ("${fromName}","${toName}","${intro}",${craftId},${price},"open");
    `,()=>{
        ctx.body = "上传成功";
    })

    let offer_id;
    await dbAll(`
        SELECT * FROM offer
        WHERE fromName = "${fromName}" AND toName = "${toName}" AND craftId = "${craftId}" AND status = "open";
    `,(err,rows)=>{
        if(err) {
            console.log(err);
        }
        console.log(rows);
        offer_id = rows[0].id;
    })
    console.log(offer_id);

    // 区块链更新
    let res = await makeOffer(offer_id,tUser.address,craft_id,price);
    console.log(res);

    // 收取金币
    let lin = await getUserByName("lin");
    res = await innerTransfer(fUser,lin,price);
    if(!res) {
        console.log("error happin in uploadCraft innerTransfer(fUser,lin,price)");
    }
})


router.post("/queryTransactionByToName",async (ctx)=>{
    const toName = ctx.request.body.toName;
    await dbAll(`
        SELECT *
        FROM offer
        WHERE toName = "${toName}" AND status = "open"
    `,(err,rows)=>{
        ctx.body = rows || [];
    });
})

router.post("/queryTransactionByFromName",async (ctx)=>{
    const fromName = ctx.request.body.fromName;
    
    await dbAll(`
        SELECT *
        FROM offer
        WHERE fromName = "${fromName}"
    `,(err,rows)=>{
        ctx.body = rows || [];
    });
})

router.post("/accOffer",async (ctx)=>{
    // 转让所有权--并且价钱
    const id = ctx.request.body.id;
    const craftId = ctx.request.body.craftId;
    const fromName = ctx.request.body.fromName;
    const toName = ctx.request.body.toName;
    const price = ctx.request.body.price;
    console.log(id,craftId,fromName,toName,price);
    const time = new Date().getTime();
    let res = await accOffer(id,time);
    console.log("accOffer: ",res);


    // 修改craft所属
    await dbRun(`
        UPDATE craft
        SET owner = "${fromName}"
        WHERE id = ${craftId}
    `);
    
    // 修改所有权历史
    await dbRun(`
        INSERT INTO craft_history (craftId,owner,time)
        VALUES (${craftId},"${fromName}",${time});
    `)


    // 修改transaction status
    await dbRun(`
        UPDATE offer
        SET status = "finish"
        WHERE id = ${id}
    `)

    const tUser = await getUserByName(toName);
    const lin = await getUserByName("lin");
    // 修改toName 资产
    res = await innerTransfer(lin,tUser,price);
    if(!res) {
        console.log("err happin in accOffer innerTransfer");
    }
    ctx.body = "ok";
})

router.post("/rejectOffer",async (ctx)=>{
    // 拒绝 -- 归还钱给fromName
    const id = ctx.request.body.id;
    const fromName = ctx.request.body.fromName;
    const price = ctx.request.body.price;
    // 修改区块链
    let res = await rejectOffer(id);
    console.log("rejectOffer: ",res);

    // 修改transaction status
    await dbRun(`
        UPDATE offer
        SET status = "close"
        WHERE id = ${id}
    `)

    // 把钱还给from
    const lin = await getUserByName("lin");
    const fUser = await getUserByName(fromName)
    await innerTransfer(lin,fUser,price);
    ctx.body = "ok";
})

router.post("/que")

router.post("/queryCraftHistoryById",async (ctx)=>{
    let craftId = ctx.request.body.craftId;
    console.log(craftId);
    await dbAll(`
        SELECT * FROM craft_history
        WHERE craftId = ${craftId}
    `,(err,rows)=>{
        if(err) {
            console.log(err);
            return ;
        }
        console.log("rows:",rows);
        ctx.body = rows || [];
    })
})



app.use(router.routes())
app.use(router.allowedMethods());
app.use((ctx)=>{
    ctx.status = 404;
    ctx.body = "404 接口不存在";
})



app.listen(7898,()=>{
    console.log(`服务器启动于: http://127.0.0.1:7898`);
})

