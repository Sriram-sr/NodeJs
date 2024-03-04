import express from 'express';
import { connect } from 'mongoose';
import { MONGODB_URI, PORT } from './utils/env-variables';
import Router from './router';

const app = express();

app.use('/api/v1/', Router);

connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT);
    console.log('Connecting to Mongodb...');
  })
  .catch(err => {
    console.log('Error while connecting mongodb ', err);
  });
