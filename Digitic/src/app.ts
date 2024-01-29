import express from 'express';
import mongoose from 'mongoose';
import { MONGODB_URI, PORT } from './utils/env-variables';
import authRoutes from './routes/auth-routes';

const app = express();

app.use('/api/v1/auth', authRoutes);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to mongodb...');
    app.listen(PORT);
  })
  .catch(err => {
    console.log('Error while connecting to mongodb ', err);
  });
