import Router from "express"
import multer from "multer";
import { ReportSubmitController } from "../controllers/reportSubmitController";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/submit", upload.any(), ReportSubmitController);

export default router;