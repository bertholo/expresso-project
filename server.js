const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('errorhandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));



app.use(errorHandler());

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}.`)
});