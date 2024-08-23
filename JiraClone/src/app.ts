import express, { NextFunction, Request, Response } from 'express';
import { connect } from 'mongoose';
import logger from 'morgan';
import Router from './router';
import { MONGODB_URI, PORT } from './utils/constants';
import { HttpError, HttpStatus } from './utils/error-handlers';
import { initialiseCounter } from './middlewares/mongoose-counter';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));

app.use('/api/v1', Router);

app.use((error: HttpError, _: Request, res: Response, _1: NextFunction) => {
  const statusCode = error.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  res.status(statusCode).json({
    message: error.message,
    data: error.data
  });
});

connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to Mongodb...');
    app.listen(PORT);
    initialiseCounter('Project', 'projectId');
    initialiseCounter('Sprint', 'sprintId');
  })
  .catch(err => {
    console.log('Error while connecting to Mongodb, ', err);
  });
