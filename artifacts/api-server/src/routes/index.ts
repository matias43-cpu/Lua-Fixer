import { Router, type IRouter } from "express";
import healthRouter from "./health";
import luaRouter from "./lua";
import generateRouter from "./generate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(luaRouter);
router.use(generateRouter);

export default router;
