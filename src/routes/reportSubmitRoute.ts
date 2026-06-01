import Router from "express"
import multer from "multer";
import { ReportSubmitController } from "../controllers/reportSubmitController";
import { verifyTokenMiddleware } from "../middlewares/verifytokenMiddleware";
const router = Router();
const upload = multer({ storage: multer.memoryStorage() });


router.post("/submit",verifyTokenMiddleware, upload.any(), ReportSubmitController);

export default router;