import { verifyToken } from "@clerk/backend";
import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const defaultAuthorizedParties = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://khujo.vercel.app",
];

function getAuthorizedParties() {
  return (
    process.env.CLERK_AUTHORIZED_PARTIES?.split(",")
      .map((party) => party.trim())
      .filter(Boolean) ?? defaultAuthorizedParties
  );
}

export async function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = (req.headers.authorization ?? req.headers.Authorization) as string | undefined;
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "");
  const token = bearerToken;
  const secretKey = process.env.CLERK_SECRET_KEY?.trim();
  const jwtKey = process.env.CLERK_JWT_KEY?.replace(/\\n/g, "\n").trim();

  if (!token) {
    return res.status(401).json({ error: "Token not found. User must sign in." });
  }

  if (!secretKey && !jwtKey) {
    return res.status(500).json({ error: "Clerk verification key is not configured." });
  }

  try {
    const verifiedToken = await verifyToken(token, {
      ...(secretKey ? { secretKey } : { jwtKey }),
      authorizedParties: getAuthorizedParties(),
    });
    (req as any).verifiedToken = verifiedToken;
    return next();
  } catch (error: any) {
    const reason = error?.reason ?? "unknown";
    console.error("verifyToken error:", reason, error?.message ?? String(error));
    return res.status(401).json({
      error: "Token not verified.",
      reason,
      details: error?.message ?? String(error),
    });
  }
}
