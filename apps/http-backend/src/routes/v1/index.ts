import { Router } from "express";
import userRouter from "./user";
import adminRouter from "./admin";
import adminEventRouter from "./admin/event";
import adminLocationRouter from "./admin/location";
import testRouter from "./test";





const router: Router = Router()


router.use('/user', userRouter)


router.use("/admin ", adminRouter);
router.use('/admin/event', adminEventRouter)
router.use("/admin/location", adminLocationRouter);


if (process.env.NODE_ENV !== "production") {

    // Used only for testting, should be never deployed in production

    // let user create test user, get JWT token and use that token to access other APIs
    router.use('/test', testRouter)
}

export default router;