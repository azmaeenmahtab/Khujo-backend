import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rootRouter from './routes/index';
import ocrRouter from './routes/ocr';
import reportSubmitRoute from './routes/reportSubmitRoute'
 import connectDB from './db/index';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';

// simple request logger to help debug 404s
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);



app.use('/', rootRouter);
app.use('/api', ocrRouter);
app.use('/report', reportSubmitRoute);
 



console.log('OCR router mounted at /api');

const startServer = async () =>{
  await connectDB();
}

startServer();

app.listen(PORT, () => {
  console.log(`Khujo Demo Backend listening on port ${PORT}`);
});
