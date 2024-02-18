import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { HttpError } from './utils/error-handlers';
import {
  MONGODB_URI,
  PORT,
  INTERNAL_SERVER_ERROR_CODE
} from './utils/env-variables';
import authRouter from './routes/auth-routes';
import { createLabelValidator } from './validators/common-validators';
import { createLabel } from './controllers/common-controllers';

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.post('/api/v1/label', createLabelValidator, createLabel);

app.use((error: HttpError, _: Request, res: Response, _1: NextFunction) => {
  const statusCode = error.statusCode || INTERNAL_SERVER_ERROR_CODE;
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
