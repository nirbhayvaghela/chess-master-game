import { asyncHandler } from "../utils/asynHandler";
import { db } from "../lib/db";
import { StatusCodes } from "../utils/constants/http_status_codes";
import * as scrypt from "../scrypt";
import jwt from "jsonwebtoken";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/helpers/generateTokens";

const options = {
  httpOnly: process.env.NODE_ENV === "production" ? true : false,
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : ("lax" as "lax" | "none"),
  secure: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
};

const signUp = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: "Missing required fields: username, email, or password",
    });
  }

  // Check if user exists in db
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ email: email }, { username: username }],
    },
  });

  // If user exists, return error
  if (existingUser) {
    return res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      message: "User with this email or username already exists",
    });
  }

  const hashedPassword = await scrypt.hash(password);
  // Create new user in db
  const newUser = await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword, 
    },
  });

  // Return success response with user data
  return res.status(StatusCodes.CREATED).json({
    status: StatusCodes.CREATED,
    data: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
    },
    message: "User created successfully",
  });
});

const signIn = asyncHandler(async (req, res) => {
  const { emailOrUsername, password } = req.body;

  // Validate input
  if (!emailOrUsername) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: "Either username or email is required",
    });
  }

  // is user exits in DB
  const existingUser = await db.user.findFirst({
    where: {
      OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
    },
  });

  // If user exists, return error
  if (!existingUser) {
    return res.status(StatusCodes.CONFLICT).json({
      status: StatusCodes.CONFLICT,
      message: "User not exists with this email or username",
    });
  }

  const isPasswordValid = await scrypt.compare(password, existingUser.password);
  if (!isPasswordValid) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      message: "Invalid password",
    });
  }

  const accessToken = generateAccessToken(existingUser.id);
  const refreshToken = generateRefreshToken(existingUser.id);

  // Update db with new tokens
  const user = await db.user.update({
    where: { id: existingUser.id },
    data: {
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });

  // Return success response with tokens
  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      status: StatusCodes.OK,
      data: {
        user,
      },
      message: "User signed in successfully",
    });
});

const logout = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  // Validate input
  if (!userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      status: StatusCodes.BAD_REQUEST,
      message: "User ID is required for logout",
    });
  }

  // Clear tokens from db
  await db.user.update({
    where: { id: userId },
    data: {
      accessToken: null,
      refreshToken: null,
    },
  });

  // Clear cookies
  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    })
    .cookie("refreshToken", "", {
      httpOnly: true,
      secure: true,
      expires: new Date(0),
    })
    .json({
      status: StatusCodes.OK,
      message: "User logged out successfully",
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!incomingRefreshToken) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      message: "unauthorized request",
    });
  }

  const decodedToken = jwt.verify(
    incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET || ""
  ) as jwt.JwtPayload;

  const user = await db.user.findUnique({
    where: { id: decodedToken.id },
  });
  if (!user || user.refreshToken !== incomingRefreshToken) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: StatusCodes.UNAUTHORIZED,
      message: "Invalid refresh token",
    });
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await db.user.update({
    where: { id: user.id },
    data: {
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
  });

  return res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({
      status: StatusCodes.OK,
      data: {
        accessToken,
        refreshToken,
      },
      message: "Tokens refreshed successfully",
    });
});

export { signUp, signIn, logout, refreshAccessToken };
