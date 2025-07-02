import jwt from 'jsonwebtoken';


export function generateAccessToken(userId: number) {
    return jwt.sign(
      {
        id: userId,
      },
      process.env.ACCESS_TOKEN_SECRET || "",
      {
        expiresIn: "1h", // Default expiry time for access token
      }
    );
};

export function generateRefreshToken(userId: number) {
    return jwt.sign(
      {
        id: userId,
      },
      process.env.REFRESH_TOKEN_SECRET || "",
      {
        expiresIn: "7d", // 
      }
    );
}