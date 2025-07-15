import { db } from "../lib/db";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asynHandler";
import jwt from "jsonwebtoken";
import { StatusCodes } from "../utils/constants/http_status_codes";
import { NextFunction, Request, Response } from "express";

export const verifyJWT = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
      
    if (!token) {
      res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Unauthorized request.",
        data: null,
      });
    }

    try {
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET || ""
      );

      const user = await db.user.findUnique({
        where: {
          id: (decodedToken as { id: number }).id,
        },
      });

      if (!user) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Invalid Access token",
          data: null,
        });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message: "Access token expired",
          data: null,
        });
      }

      res.status(StatusCodes.UNAUTHORIZED).json({
        statusCode: StatusCodes.UNAUTHORIZED,
        success: false,
        message: "Invalid Access token",
        data: null,
      });
    }
  }
);
