require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const logger = require('./logger');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// error handler
app.use((error, req, res, next) => {
  let response;
  if(NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  return res.status(500).json(response);
});

// validate Bearer token
app.use((req, res, next) => {
  const token = process.env.API_KEY;
  const authToken = req.get('Authorization');

  (!authToken || authToken.split(' ')[1] !== token) 
    && logger.error(`Unauthorized request to path: ${req.path}`)
    && res.status(401).json({error: 'Unauthorized request'});
  next();
});

app.get('/', (req, res) => {
  return res.json('Hello, world!'); 
});

module.exports = app;