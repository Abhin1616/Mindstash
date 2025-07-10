import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";


const app = express();
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const MONGODB_URL = process.env.MONGODB_URL;
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGODB_URL)
    .then(() => {
        console.log("Database connected successfully!")
        app.listen(PORT, () => {
            console.log(`Listening at PORT ${PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })