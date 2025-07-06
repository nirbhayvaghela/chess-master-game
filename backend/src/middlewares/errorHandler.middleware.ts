// errorMiddleware.ts
import { ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(errorHandler,"error")
  if (err instanceof ApiError) {
    console.log(err,"apiError")
    res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      data: err.data,
      errors: err.errors,
    });
    return; 
  }

  console.error("Unhandled error:", err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    data: null,
    errors: [],
  });
  return; 
};
