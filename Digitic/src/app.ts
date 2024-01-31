import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { MONGODB_URI, PORT, ServerErrorCode } from './utils/env-variables';
import authRoutes from './routes/auth-routes';

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/auth', authRoutes);

app.use((error: any, _: Request, res: Response, _1: NextFunction) => {
  const statusCode = error.statusCode || ServerErrorCode;
  res.status(statusCode).json({
    message: error.message,
    data: error.data
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to mongodb...');
    app.listen(PORT);
  })
  .catch(err => {
    console.log('Error while connecting to mongodb ', err);
  });
