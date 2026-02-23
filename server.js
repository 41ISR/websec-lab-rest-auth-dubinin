require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/database');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

app.listen(3000, () => {
  console.log('Server running on port 3000');
});