// types/express.d.ts
import { User } from "@prisma/client"; // Adjust the import based on your Prisma setup

declare global {
    namespace Express {
        interface Request {
            user?: any; // Optional user property to hold the authenticated user
        }
    }
}