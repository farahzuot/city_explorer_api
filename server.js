
'use strict';


const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();


const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;


const app = express();
app.use(cors());


app.get('/', homePage);

app.get('/location', locationHndler);

app.get('/weather', weatherPage);

//  trial Route
app.get('/trails',trailsHandler);
//---------

app.use('*', (req, res) => {
  res.status(404).send('Error');
});



// function Location(city, locationData) {
//   this.search_query = city;
//   this.formatted_query = locationData[0].display_name;
//   this.latitude = locationData[0].lat;
//   this.longitude = locationData[0].lon;
// }

function Location(city, locationData) {

  this.search_query = city;
  this.formatted_query = locationData[0].display_name;
  this.latitude = locationData[0].lat;
  this.longitude = locationData[0].lon;
}

function Weather(weatherData) {
  this.forecast = weatherData.weather.description;
  this.time = weatherData.datetime;
}

// Trail constructor
function Trail(trailObj){
  this.name=trailObj.name;
  this.location = trailObj.location;
  this.length = trailObj.length;
  this.stars = trailObj.stars;
  this.star_votes = trailObj.starVotes;
  this.summary = trailObj.summary;
  this.trail_url= trailObj.url;
  this.conditions = trailObj.conditionDetails;
  this.condition_date = trailObj.conditionDate;
}


//for(500) error
Location.prototype.errorHandler= function(){
  if(!this.formatted_query.includes(this.search_query)){
    error();
  }
};


app.listen(PORT, () => {
  console.log(PORT);

});

// helpers

function homePage(req, res) {

  res.send('Hello! you are in the home page');
}
// function locationPage(req, res) {

//   const city = req.query.city;
//   const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
//   superagent.get(url).then(Data => {
//     let location = new Location(city, Data.body);
//     res.json(location);
//   }).catch(console.error);
// }

function locationHndler(request, response) {
  const city = request.query.city;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
  superagent.get(url).then(locationData => {
    //console.log(locationData.body);
    let location = new Location(city, locationData.body);
    response.json(location);
  });
}


function weatherPage(req, res) {
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=38.123&lon=-78.543&key=${WEATHER_API_KEY}`;


  superagent.get(url).then(weatherData => {
    let weather = weatherData.body.data.map(Data => {
      return new Weather(Data);
    });
    res.json(weather);
  }).catch(console.error);
}


function trailsHandler(reqeust, response){
  // const url = `https://www.hikingproject.com/data/get?lat=40.0274&lon=-105.2519&maxDistance=10&key=${TRAILQ}`;
  const url = `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=200959308-d46bf86a332e86ae55bf43b6e24ea048`;
  superagent.get(url).then(trailsData => {
    let trail = trailsData.body.trails.map(Data => {
      return new Trail(Data);
    });
    response.json(trail);
  }).catch(console.error);
}

function error(request, resp) {
  resp.status(500).send('Error ! ');
}
