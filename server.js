
'use strict';


const express = require('express');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;


const app = express();
app.use(cors());


app.get('/', (req, res) => {
  res.send('Hello! you are in the home page');
});

app.get('/location', (req, res) => {
  const locData = require('./data/location.json');
  const city = req.query.city;
  let location;
  locData.forEach(Data => {
    location = new Location(city, Data);
  });
  res.json(location);
});

app.get('/weather', (req, res) => {
  const wetData = require('./data/weather.json');
  // console.log(wetData.data.datetime);
  let weather = [];
  wetData.data.forEach(Data => {
    console.log(Data);
    weather.push(new Weather(Data));
  });
  res.json(weather);
});


app.use('*', (req, res) => {
  res.status(404).send('Error');
});



function Location(city, locationData) {
  this.search_query = city;
  this.formatted_query = locationData.display_name;
  this.latitude = locationData.lat;
  this.longitude = locationData.lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.datetime;
}


app.listen(PORT, () =>{
  console.log(PORT);

});


