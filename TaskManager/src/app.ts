import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { HttpError } from './utils/error-handlers';
import { ServerErrorCode } from './utils/env-variables';
import { MONGODB_URI, PORT } from './utils/env-variables';
import authRoutes from './routes/auth-routes';

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/auth', authRoutes);

app.use((error: HttpError, _: Request, res: Response, _1: NextFunction) => {
  res.statusCode = error.statusCode || ServerErrorCode;
  res.json({
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
