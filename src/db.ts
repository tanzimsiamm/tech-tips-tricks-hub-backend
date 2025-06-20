import mongoose from 'mongoose';
import config from './config'; // Import your config

const connectDB = async () => {
    try {
        if (!config.db_url) { // Use config.db_url
            throw new Error('DATABASE_URL is not defined in environment variables');
        }
        const conn = await mongoose.connect(config.db_url);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;