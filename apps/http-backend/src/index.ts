import express from "express";
import v1Router from "./routes/v1/index";
import dotenv from "dotenv";

dotenv.config();


const app = express()

app.use(express.json())

app.use('/api/v1', v1Router)



app.listen(8080, () => {
    console.log("Server is running on port 8080")
})