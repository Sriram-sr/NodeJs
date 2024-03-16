import express from 'express';
import { connect } from 'mongoose';
import { MONGODB_URI, PORT } from './utils/env-variables';
import authRouter from './routes/auth-routes';

if (!MONGODB_URI) {
  console.error(
    'Mongodb URI is not defined. Please provide connection string as a environment variable.'
  );
  process.exit(1);
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/auth', authRouter);

connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to Mongodb');
    app.listen(PORT);
  })
  .catch(err => {
    console.log('Error while connecting to Mongodb, ', err);
  });
