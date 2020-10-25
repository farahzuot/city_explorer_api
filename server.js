'use strict';


const express = require('express');
const cors = require('cors');
require('dotenv').config();


const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());


app.get('/', (request,response)=>{
  response.send('hello there');

});

app.use('*', (req,res)=>{
  res.status(404).send('Error');
});

app.listen(PORT, ()=>{
  console.log('listening to the port');
});
