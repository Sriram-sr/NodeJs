import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { HttpError } from './utils/error-handlers';
import { ServerErrorCode } from './utils/env-variables';
import { MONGODB_URI, PORT } from './utils/env-variables';
import authRoutes from './routes/auth-routes';
import taskRoutes from './routes/task-routes';
import labelRoutes from './routes/label-routes';

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/task', taskRoutes);
app.use('/api/v1/label', labelRoutes);

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
