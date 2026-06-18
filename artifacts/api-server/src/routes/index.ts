import { Router, type IRouter } from "express";
import healthRouter from "./health";
import luaRouter from "./lua";

const router: IRouter = Router();

router.use(healthRouter);
router.use(luaRouter);

export default router;
