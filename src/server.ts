
import app from './app'; 
import connectDB from './db'; 
import config from './config'; 

async function main() {
    try {
        await connectDB(); 

        app.listen(config.port, () => {
            console.log(`Server running on port ${config.port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

main();