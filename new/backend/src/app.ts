import express from 'express';
import { frontendUrl, cookieSecret } from './config/env.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import session from 'express-session';
import cvRouter from './routers/cvRouter.js';
import authRouter from './routers/authRouter.js';
import dashboardRouter from './routers/dashboardRouter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cookieParser()); // Permet de recevoir et traiter des cookies

// Gestion des CORS.
app.use(cors({
  origin: frontendUrl,
  credentials: true,
}));

app.use(express.json());

// app.use(express.urlencoded({ extended: true })); // Utilisé pour lire les <form> bruts

app.use(helmet());

app.use(session({
    secret:cookieSecret,
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
        maxAge:1800000,
    }
}))

app.use('/api/cv', cvRouter);
app.use('/api/auth', authRouter);
app.use('/api/cv/dashboard', dashboardRouter);

app.use(errorHandler);

export default app;
