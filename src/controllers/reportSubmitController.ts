import type { Request, Response } from "express"
import { ReportSubmitService } from "../services/reportSubmitService";
import { ReportSubmitInputType } from "../services/reportSubmitService";


export const ReportSubmitController = (req: Request, res: Response) => {
    

    const {imei1, imei2, division, district, upazilla, street} = req.body;

    const ReportSubmitInput: ReportSubmitInputType = {
        imei1: imei1,
        

    }

    const response = ReportSubmitService(ReportSubmit);
}