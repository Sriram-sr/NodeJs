import express, { Request, Response, NextFunction } from 'express';
import { connect } from 'mongoose';
import logger from 'morgan';
import { MONGODB_URI, PORT } from './utils/env-variables';
import Router from './routes';
import { HttpError, HttpStatus } from './utils/error-handlers';
import { initializeCounter } from './middlewares/mongoose-counter';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
    console.log('Connected to mongodb...');
    initializeCounter('Product', 'productId');
    app.listen(PORT);
  })
  .catch(err => {
    console.log(`Error while connecting to mongodb ${err}`);
  });
