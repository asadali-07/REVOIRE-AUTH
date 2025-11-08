import express from 'express';
import authRouter from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import { connect } from './broker/broker.js';
import cors from 'cors';


const app = express();
connect();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRouter);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Auth service is running"
    });
})

export default app;