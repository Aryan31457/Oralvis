import express from "express";
import bodyParser from "body-parser";
import config from './config/server-config.js';
import router from './routes/index.js';
import mongoose from "mongoose";
import cors from 'cors';

const app = express();

// Allow all origins for development
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', router);
const setupandstartserver = async () => {
    try {
        await mongoose.connect(config.MONGODB_URL);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.log('MongoDB not connected');
        throw error;
    }

    app.listen(config.PORT, () => {
        console.log(`Server starting at ${ config.PORT }`);
    });
};

setupandstartserver();