import type { Request, Response } from "express"
import { ReportSubmitService } from "../services/reportSubmitService";
import { ReportSubmitInputType } from "../services/reportSubmitService";


export const ReportSubmitController = async (req: Request, res: Response) => {
    const {user_id, imei1, imei2, division, district, upazila, upazilla, street, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date } = req.body ?? {};

    //this user_id is basically the clerk id of the user , from this i am getting the local id of that user by quering in my local db and using that local id to save report and further use 

   console.log(user_id)
   console.log(typeof(user_id))

    const theft_location = [street, upazila ?? upazilla, district, division].filter(Boolean).join(", ");

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
        return res.status(400).json({
            message: "error occured",
            error: err instanceof Error ? err.message : "could not save report info"
        })
    }

    
 }