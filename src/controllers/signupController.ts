import type { Request, Response } from "express"
import { SignUpService, SignUpServiceInputDataType } from "../services/auth/signUpService";

export const SingUpController = (req: Request, res: Response) => {

    const {clerk_id, name, phone_number, nid} = req.body;

    const SignUpServiceInputData: SignUpServiceInputDataType = {
        clerk_id,
        name,
        phone_number,
        nid
    }

    SignUpService(SignUpServiceInputData);
    
}