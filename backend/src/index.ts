import express from "express";
import { Request, Response } from "express";

const app = express();
const port = 3000;

interface HelloWorldRequest extends Request {}
interface HelloWorldResponse extends Response {}

app.use("/api/v1/auth", )

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
