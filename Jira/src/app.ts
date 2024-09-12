import express from 'express';
import { connect } from 'mongoose';
import logger from 'morgan';
import { MONGODB_URI, PORT } from './utils/constants';

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to Mongodb...');
    app.listen(PORT);
  })
  .catch(err => {
    console.log(`Error while connecting to Mongodb, ${err}`);
  });
