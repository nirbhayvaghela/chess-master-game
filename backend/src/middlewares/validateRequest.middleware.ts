import { Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { StatusCodes } from "../utils/constants/http_status_codes";

export function validateData(schema: z.ZodObject<any, any, any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (result.success) {
      next();
    } else {
      const errorMessages =
        result.error.errors
          .map((issue) => issue.path.join(".") || "body")
          .join(", ") + " required";

      res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "Invalid data", details: errorMessages });
    }
  };
}
