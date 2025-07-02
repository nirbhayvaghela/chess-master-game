import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

import authRouter from "./routes/auth.route";

dotenv.config({
  path: './.env'
})

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials:true
}))
app.use(express.json({limit: "16kb"})); 
app.use(express.urlencoded({extended: true,limit: "16kb"} )); 
app.use(express.static("public")); 
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);

app.listen(process.env.PORT || 8000, () => {
  console.log(`Example app listening on port ${process.env.PORT || 8000}`);
});
