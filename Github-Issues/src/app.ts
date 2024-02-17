import express from 'express';
import mongoose from 'mongoose';
import logger from 'morgan';
import { MONGODB_URI, PORT } from './utils/env-variables';

const app = express();

app.use(logger('dev'));

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to mongodb...');
    app.listen(PORT);
  })
  .catch(err => {
    console.log('Error while connecting to mongodb ', err);
  });
