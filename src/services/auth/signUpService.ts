import pool from "../../db/connection";

export interface SignUpServiceInputDataType {
    clerk_id: string;
    name: string;
    phone_number: string;
    nid: string;
}

export type SignUpServiceResponseType = {
    id: number;
    clerk_id: string;
    name: string;
    phone_number: string;
    nid: string | null;
};

export class SignUpServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.name = "SignUpServiceError";
        this.statusCode = statusCode;
    }
}


export const SignUpService = async ({clerk_id, name, phone_number, nid } : SignUpServiceInputDataType) => {

    const existingUser = await pool.query(
        "SELECT id FROM users WHERE clerk_id = $1 OR phone_number = $2 LIMIT 1",
        [clerk_id, phone_number]
    );

    if (existingUser.rowCount && existingUser.rowCount > 0) {
        throw new SignUpServiceError("user already exists", 409);
    }

    const result = await pool.query(
        "INSERT INTO users (clerk_id, name, phone_number, nid) VALUES ($1, $2, $3, $4) RETURNING id, clerk_id, name, phone_number, nid",
        [clerk_id, name, phone_number, nid || null]
    );

    return result.rows[0] as SignUpServiceResponseType;

}