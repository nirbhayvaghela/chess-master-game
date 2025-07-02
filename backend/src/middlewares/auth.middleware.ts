import { db } from "../lib/db";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asynHandler";
import jwt from "jsonwebtoken";
import { StatusCodes } from "../utils/constants/http_status_codes";
import { NextFunction, Request, Response } from "express";

export const verifyJWT = asyncHandler(async (req: Request, _: Response, next: NextFunction) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request.");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "");

    const user = await db.user.findUnique({
        where: {
            id: (decodedToken as { id: number }).id
        }
    });
    if (!user) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Access token");
    }

    req.user = user;
    next();
})