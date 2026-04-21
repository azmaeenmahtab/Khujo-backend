import pool from "./../db/connection"

export type ReportSubmitInputType = {
    user_id: number;
    imei1: string;
    imei2: string;
    theft_location: string;
    gd_copy_image_url: string;
    phone_box_image_url?: string;
    phone_model: string;
    phone_brand: string;
    theft_date: string;
}

type ReportSubmitResponseType = {


}

export const ReportSubmitService = async ({user_id, imei1, imei2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date }: ReportSubmitInputType) => {

    try{

    const result = await pool.query("INSERT INTO reports (user_id, imei_number_1 , imei_number_2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8 , $9) RETURNING id, user_id, imei_number_1, imei_number_2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date", [user_id, imei1, imei2, theft_location, gd_copy_image_url, phone_box_image_url, phone_brand, phone_model, theft_date]);

    if(result){

        return {
        user_id,
        imei1,
        imei2,
        theft_location,
        gd_copy_image_url,
        phone_box_image_url: phone_box_image_url ?? null, 
        phone_brand, phone_model, theft_date// this is called the nullish coalescing operator
        };
    }


    }catch(err){
        console.log(err, " error ");

        throw new Error("could not save report info");
    }

    

}