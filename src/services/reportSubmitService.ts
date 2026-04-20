

export type ReportSubmitInputType = {
    imei1: string;
    imei2: string;
    theft_location: string;
    gd_copy_image_url: string;
    phone_box_image_url?: string;
}

type ReportSubmitResponseType = {


}

export const ReportSubmitService = ({ imei1, imei2, theft_location, gd_copy_image_url, phone_box_image_url }: ReportSubmitInputType) => {



    return {
        imei1,
        imei2,
        theft_location,
        gd_copy_image_url,
        phone_box_image_url: phone_box_image_url ?? null,
    };

}