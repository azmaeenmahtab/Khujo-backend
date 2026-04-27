import type { Request, Response } from "express"
import { ReportSubmitService } from "../services/reportSubmitService";
import { ReportSubmitInputType } from "../services/reportSubmitService";


export const ReportSubmitController = async (req: Request, res: Response) => {
    

    const {user_id,imei1, imei2, division, district, upazilla, street, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date } = req.body;

    console.log(req, "request");

   

    const theft_location = [street, upazilla, district, division].filter(Boolean).join(", ");

    const reportSubmitInput: ReportSubmitInputType = {
        user_id,
        imei1,
        imei2,
        theft_location,
        gd_copy_image_url,
        phone_box_image_url,
        phone_model,
        phone_brand,
        theft_date
    };

    try{
    const response = await ReportSubmitService(reportSubmitInput);

    return res.status(200).json({
        message: "report successfully saved",
        report: response
    })

    
    }catch(err){
        console.log(err, "error")
        return res.status(401).json({
            message: "error occured",
            error: err
        })
    }

    
 }