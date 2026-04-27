import pool from "./../db/connection"

export type ReportSubmitInputType = {
    user_id: string;
    imei1: string;
    imei2: string;
    theft_location: string;
    gd_copy_image_url: string;
    phone_box_image_url?: string;
    phone_model: string;
    phone_brand: string;
    theft_date: string;
}

export const ReportSubmitService = async ({user_id, imei1, imei2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date }: ReportSubmitInputType) => {

    try{

    const clerkId = user_id.startsWith("user_") ? user_id.slice(5) : user_id;
    if (!clerkId) {
        throw new Error("Invalid user_id");
    }

    const userLookup = await pool.query("SELECT id FROM users WHERE clerk_id = $1 LIMIT 1", [clerkId]);
    if (!userLookup.rowCount || !userLookup.rows[0]?.id) {
        throw new Error("No local user found for this clerk_id");
    }

    const localUserId = Number(userLookup.rows[0].id);

    const result = await pool.query("INSERT INTO reports (user_id, imei_number_1 , imei_number_2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9) RETURNING id, user_id, imei_number_1, imei_number_2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date", [localUserId, imei1, imei2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date]);

    if(result){

        return {
        user_id: localUserId,
        imei1,
        imei2,
        theft_location,
        gd_copy_image_url,
        phone_box_image_url: phone_box_image_url ?? null, 
        phone_brand, phone_model, theft_date// this is called the nullish coalescing operator
        };
    }

    console.log(result)


    }catch(err){
        console.log(err, " error ");

        throw new Error("could not save report info");
    }

    

}