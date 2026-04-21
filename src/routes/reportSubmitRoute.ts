import Router from "express"
import { ReportSubmitController } from "../controllers/reportSubmitController";
const router = Router();


router.post("/submit", ReportSubmitController);

export default router;