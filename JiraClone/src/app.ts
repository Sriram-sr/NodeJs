import express from 'express';
import { connect } from 'mongoose';
import { MONGODB_URI, PORT } from './utils/constants';

const app = express();

app.use('/', (_, res, _1) => {
  res.status(200).json({
    message: 'Express/Mongoose configuration success'
  });
});

connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to Mongodb...');
    app.listen(PORT);
  })
  .catch(err => {
    console.log('Error while connecting to Mongodb, ', err);
  });
