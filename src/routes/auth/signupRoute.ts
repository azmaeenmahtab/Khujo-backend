import { Router } from "express";
import { SingUpController } from "../../controllers/signupController";

const router = Router();

router.post("/create", SingUpController);

export default router;