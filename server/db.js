// db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const MONGODB_URL = process.env.MONGODB_URL;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ MongoDB connected from db.js");
    } catch (err) {
        console.error("❌ MongoDB connection error from db.js:", err);
        process.exit(1); // Exit if DB connection fails
    }
};

export default connectDB;