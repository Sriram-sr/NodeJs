import express from 'express';
import { connect } from 'mongoose';
import { MONGODB_URI, PORT } from './utils/constants';
import Router from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/v1/', Router);

connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to Mongodb...');
    app.listen(PORT);
  })
  .catch(err => {
    console.log(`Error while connecting to mongodb... ${err}`);
  });
