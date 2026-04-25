import type { Request, Response } from "express"
import { SignUpService, SignUpServiceError, SignUpServiceInputDataType } from "../services/auth/signUpService";

export const SingUpController = async (req: Request, res: Response) => {

    const {clerk_id, name, phone_number, nid} = req.body;

    if (!clerk_id || !name || !phone_number) {
        return res.status(400).json({
            success: false,
            message: "clerk_id, name and phone_number are required"
        });
    }

    const SignUpServiceInputData: SignUpServiceInputDataType = {
        clerk_id: String(clerk_id),
        name: String(name),
        phone_number: String(phone_number),
        nid: nid ? String(nid) : ""
    }

    try{
        const result = await SignUpService(SignUpServiceInputData);

        return res.status(200).json({

            success: true,
            message: "user created successfully",
            user: result
        })

    }catch(err: unknown){
        if (err instanceof SignUpServiceError) {
            return res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }

        return res.status(500).json({

            success: false,
            message: "internal error occured"
        })
    }

    
}