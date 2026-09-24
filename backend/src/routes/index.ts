import { Router, type IRouter } from "express";
import healthRouter from "./health.ts";
import authRouter from "./auth.ts";
import contentRouter from "./content.ts";
import leadsRouter from "./leads.ts";
import adminRouter from "./admin.ts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(leadsRouter);
router.use(adminRouter);

export default router;
