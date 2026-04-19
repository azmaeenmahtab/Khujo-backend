import type { Request, Response } from "express"


export const ReportSubmitController = (req: Request, res: Response) => {

    const {imei1, imei2, division, district, upazilla, street} = req.body;
}