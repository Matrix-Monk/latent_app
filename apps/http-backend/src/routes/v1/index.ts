import { Router } from "express";
import userRouter from "./user";
import bookingsRouter from "./user/bookings";
import transactionRouter from "./user/transaction";
import adminRouter from "./admin/index";
import adminEventRouter from "./admin/event";
import superAdminRouter from "./superadmin";
import adminLocationRouter from "./admin/location";

import testRouter from "./test";





const router: Router = Router()


router.use('/user', userRouter)
router.use("/user/bookings", bookingsRouter);
router.use("/user/transaction", transactionRouter);




router.use("/admin", adminRouter);
router.use('/admin/event', adminEventRouter)
router.use("/admin/location", adminLocationRouter);


router.use("/superadmin", superAdminRouter);

if (process.env.NODE_ENV !== "production") {

    // Used only for testting, should be never deployed in production

    // let user create test user, get JWT token and use that token to access other APIs
    router.use('/test', testRouter)
}

export default router;