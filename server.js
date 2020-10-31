
'use strict';


const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();


const PORT = process.env.PORT || 3000;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const TRAIL_API_KEY = process.env.TRAIL_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const MOVIES = process.env.MOVIES;
const YELP = process.env.YELP;
const client = new pg.Client(DATABASE_URL);


const app = express();
app.use(cors());


app.get('/', homePage);

app.get('/location', locationHndler);

app.get('/weather', weatherPage);

app.get('/trails', trailsHandler);

app.get('/movies', moviesHandler);

app.get('/yelps', yelpsHandler);

app.use('*', (req, res) => {
  res.status(404).send('Error');
});



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


function Trail(trailObj) {
  this.name = trailObj.name;
  this.location = trailObj.location;
  this.length = trailObj.length;
  this.stars = trailObj.stars;
  this.star_votes = trailObj.starVotes;
  this.summary = trailObj.summary;
  this.trail_url = trailObj.url;
  this.conditions = trailObj.conditionDetails;
  this.condition_date = trailObj.conditionDate;
}

function Movie(movieObj) {
  this.title = movieObj.title;
  this.overview = movieObj.overview;
  this.vote_average = movieObj.vote_average;
  this.vote_count = movieObj.vote_count;
  this.poster_path = movieObj.poster_path;
  this.popularity = movieObj.popularity;
  this.release_date = movieObj.release_date;
}

function Yelp(yelpObj) {
  this.name = yelpObj.name;
  this.image_url = yelpObj.image_url;
  this.price = yelpObj.price;
  this.rating = yelpObj.rating;
  this.url = yelpObj.url;
}

function homePage(req, res) {

  res.send('Hello! you are in the home page');
}


function locationHndler(request, response) {
  const location = 'SELECT * FROM location WHERE search_query=$1;';
  const city = request.query.city;
  const safrvar = [city];
  client.query(location, safrvar).then(result => {
    if (!(result.rowCount === 0)) {
      response.status(200).json(result.rows[0]);
    }
    else {
      const url = `https://eu1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${city}&format=json`;
      let locationArr;
      superagent.get(url).then(locationData => {
        locationArr = new Location(city, locationData.body);
        const newValues = 'INSERT INTO location (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4);';
        const saveValues = [locationArr.search_query, locationArr.formatted_query, locationArr.latitude, locationArr.longitude];
        client.query(newValues, saveValues).then(() => {
          response.status(200).json(locationArr);
        });
      });
    }
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


function trailsHandler(reqeust, response) {
  let lat=reqeust.query.latitude;
  let lon=reqeust.query.longitude;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${TRAIL_API_KEY}`;
  superagent.get(url).then(trailsData => {
    let trail = trailsData.body.trails.map(Data => {
      return new Trail(Data);
    });
    response.json(trail);
  }).catch(console.error);
}



function moviesHandler(request, response) {
  let region =request.query.search_query.slice(0,2).toUpperCase();
  const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${MOVIES}&region=${region}`;
  superagent.get(url).then(moviesData => {
    let movie = moviesData.body.results.map(Data => {
      return new Movie(Data);
    });
    response.json(movie);
  }).catch(console.error);
}



function yelpsHandler(request, response) {
  const region = request.query.search_query;
  const longitude = request.query.longitude;
  const latitude = request.query.latitude;
  console.log(region);
  const page=request.query.page;
  let offset=5*(page-1);
  const url = `https://api.yelp.com/v3/businesses/search`;
  let queryParemeter={
    location:region,
    latitude:latitude,
    longitude:longitude,
    api_key:YELP,
    offset:offset,
    limit:5,
    categories:'Restaurants',
    format:'json'
  };
  superagent.get(url).query(queryParemeter).set('Authorization', `Bearer ${YELP}`).then(yelpsData => {
    let yelps = yelpsData.body.businesses.map((value) => {
      return (new Yelp(value));
    });
    response.json(yelps);
  }).catch(console.error);
}

client.connect().then(() => {
  app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
}).catch(console.error);

