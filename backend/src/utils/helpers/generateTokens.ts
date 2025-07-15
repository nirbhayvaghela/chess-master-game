import jwt, { SignOptions } from "jsonwebtoken";

export function generateAccessToken(userId: number) {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.ACCESS_TOKEN_SECRET || "",
    {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "1d") as SignOptions['expiresIn'],
    }
  );
}

export function generateRefreshToken(userId: number) {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.REFRESH_TOKEN_SECRET || "",
    {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "1d") as SignOptions['expiresIn'],
    }
  );
}
