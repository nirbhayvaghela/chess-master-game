import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err: any) {
      res.status(err.code || 500).json({
        success: false,
        message: err.message || 'Something went wrong',
      });
    }
  };
};
