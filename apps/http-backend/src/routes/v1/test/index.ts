import { Router } from "express";
import { createAdmin } from "../../../controllers/test";



const router: Router = Router();


router.post("/create-test-admin", async (req, res) => {
    const { phoneNumber, name } = req.body;


    if (!phoneNumber || !name) {
        res.status(400).json({ message: "phoneNumber and name are required" });
        return;
    }

    const token = await createAdmin({ phoneNumber, name , type: "CREATOR"})
    

    res.status(201).json({
        token
    })
})


router.post("/create-test-superadmin", async (req, res) => {
  const { phoneNumber, name } = req.body;

  if (!phoneNumber || !name) {
    res.status(400).json({ message: "phoneNumber and name are required" });
    return;
  }

  const token = await createAdmin({ phoneNumber, name, type: "SUPERADMIN" });

  console.log("Generated test superadmin token:", token);

  res.status(201).json({
    token,
  });
});


    





export default router;