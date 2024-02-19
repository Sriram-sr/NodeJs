import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { HttpError, HttpStatus } from './utils/error-handlers';
import { MONGODB_URI, PORT } from './utils/env-variables';
import { initializeCounter } from './utils/mongoose-counter';
import { createLabelValidator } from './validators/issue-validators';
import { getLabels, createLabel } from './controllers/common-controllers';
import authRouter from './routes/auth-routes';
import issueRouter from './routes/issue-routes';

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/api/v1/label', getLabels);
app.post('/api/v1/label', createLabelValidator, createLabel);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/issue', issueRouter);

app.use((error: HttpError, _: Request, res: Response, _1: NextFunction) => {
  const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
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
    initializeCounter('Issue', 'issueId');
    initializeCounter('PullRequest', 'prId');
  })
  .catch(err => {
    console.log('Error while connecting to mongodb ', err);
  });
