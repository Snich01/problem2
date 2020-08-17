import engine from "./engine/engine"
import Koa from "koa"
import Router from "koa-router"
import {findMaxValue} from "./db/DBfunctions"

const app = new Koa();
const router = new Router();

engine.mainProcess()

router.get('/', async (ctx) => {
    const {rows} = await findMaxValue()
    ctx.body = rows[0].user_code;
});

app.use(router.routes())
app.listen(3000, () => {
    console.log('Server running on port 3000');
});

setInterval(engine.mainProcess, 10 * 60 * 1000)