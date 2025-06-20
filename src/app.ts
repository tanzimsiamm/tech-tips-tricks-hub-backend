import express from 'express';
import cors from 'cors';
import router from './routes';
import globalErrorHandler from './middleware/globalErrorHandler'; 
import notFound from './middleware/notFound'; 
import config from './config'; 

const app = express();

// Use JSON body parser
app.use(express.json());

// Use CORS
app.use(cors({ origin: config.NODE_ENV === 'production' ? config.FRONTEND_URL : '*' }));

// Use main router for /api endpoint
app.use('/api', router);

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Hello World! API is running...');
});

// Global error handler
app.use(globalErrorHandler);

// Not Found handler
app.use(notFound);


export default app;