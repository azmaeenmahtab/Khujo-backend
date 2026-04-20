import type { Request, Response } from "express"
import { ReportSubmitService } from "../services/reportSubmitService";
import { ReportSubmitInputType } from "../services/reportSubmitService";


export const ReportSubmitController = (req: Request, res: Response) => {
    

    const { imei1, imei2, division, district, upazilla, street, gd_copy_image_url, phone_box_image_url } = req.body;

    const theft_location = [street, upazilla, district, division].filter(Boolean).join(", ");

    const reportSubmitInput: ReportSubmitInputType = {
        imei1,
        imei2,
        theft_location,
        gd_copy_image_url,
        phone_box_image_url,
    };

    const response = ReportSubmitService(reportSubmitInput);
    return res.status(200).json(response);
}