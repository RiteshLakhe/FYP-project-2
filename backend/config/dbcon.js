const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not set in backend/.env");
        }

        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB connected sucessfully");
    } catch (err) {
        console.error(`MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;
