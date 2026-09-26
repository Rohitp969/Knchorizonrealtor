import { Router, type IRouter } from "express";
import healthRouter from "./health.ts";
import authRouter from "./auth.ts";
import contentRouter from "./content.ts";
import leadsRouter from "./leads.ts";
import seoRouter from "./seo.ts";
import adminRouter from "./admin.ts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(contentRouter);
router.use(leadsRouter);
// Before adminRouter: its router-wide requireAdmin would otherwise refuse SEO managers.
router.use(seoRouter);
router.use(adminRouter);

export default router;
