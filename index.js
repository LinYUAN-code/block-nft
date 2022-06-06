const Koa = require("koa")
const Router = require("koa-router")
const KoaStatic = require("koa-static")
const fs = require("fs");
const path = require("path")


const app = new Koa();

app.use(KoaStatic("./static"));

const router = new Router();

router.get("/",(ctx)=>{
    const html = fs.readFileSync(path.join(__dirname,"/templates/index.html"));
    ctx.response.type = "html";
    ctx.body = html;
})
router.post("/login",(ctx)=>{
    
})
router.post("/registe",(ctx)=>{

})
router.post("/add",(ctx)=>{
    ctx.body = "200";
})
router.post("/transfer",(ctx)=>{
    ctx.body = "100";
})
router.post("/login",(ctx)=>{

})
router.post("/register",(ctx)=>{
    
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
