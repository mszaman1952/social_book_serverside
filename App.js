// Important modules has been imported
const {readdirSync}= require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require("helmet");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressRateLimit = require('express-rate-limit');
const morgan = require('morgan');
const router = require('./Routers/API');

// Import data from env file
require('dotenv').config();
const {PORT,DATA} = process.env;
router.use(express.static('public'));


// security middleware....
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));


// Express Rate limit
const limiter = expressRateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many request sent by this ip. Please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
});
app.use(limiter);


// listen Router file....
// readdirSync('./Routers').map(R=>app.use('/api/v1',require(`./Routers/${R}`)));
app.use('/api/v1', router)

app.use('*',(req,res)=>{
    res.status(404).json({message:"Something is happening please try again."});
});


// exports app,port,mongoose....
module.exports = {PORT,app,mongoose,DATA};