import { Router, Request, Response } from "express";
import pool from "../db/connection";

const router = Router();

router.get("/:imei", async (req: Request, res: Response) => {
    const imei = req.params.imei;

    try {
        const result = await pool.query(
            `SELECT
                r.imei_number_1,
                r.phone_model,
                r.verification_status,
                r.theft_date,
                r.created_at AS reported_date,
                r.theft_location,
                u.name AS owner_name
             FROM reports r
             INNER JOIN users u ON u.id = r.user_id
             WHERE r.imei_number_1 = $1 OR r.imei_number_2 = $1
             ORDER BY r.created_at DESC
             LIMIT 1`,
            [imei]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "No report found for this IMEI" });
        }

        const row = result.rows[0];

        return res.status(200).json({
            message: "Report found for this IMEI",
            data: {
                imei: row.imei_number_1,
                phone_model: row.phone_model,
                ownerName: row.owner_name,
                status: row.verification_status,
                stolenDate: row.theft_date,
                reportedDate: row.reported_date,
                stolenFrom: {
                    place: row.theft_location,
                    area: "",
                    city: ""
                }
            }
        });
    } catch (err) {
        console.error("Error checking IMEI:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export default router;