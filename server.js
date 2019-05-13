require('dotenv').config();
const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const MOVIEDEX = require('./movies-data-small.json');

const app = express();

const morganSetting = process.env.NODE_ENV = 'production' ? 'tiny' : 'dev'
app.use(morgan(morganSetting));
app.use(cors());
app.use(helmet());

app.use(function validateBearToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;

    if(!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    next();
});

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_ENV === 'production') {
        response = { error: { message: 'server error' }}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

function handleGetMovie(req, res) {
    const { title, genre, country, avg_vote } = req.query;

    let response = MOVIEDEX;

    if(title) {
        response = response.filter(movie =>
            movie.film_title.toLowerCase().includes(title.toLowerCase())
        )
    }

    if(genre) {
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(genre.toLowerCase())
        )
    }

    if(country) {
        response = response.filter(movie =>
            movie.country.toLowerCase().includes(country.toLowerCase())
        )
    }

    if(avg_vote) {
        response = response.filter(movie => 
            movie.avg_vote >= Number(avg_vote)
        )
    }


    res.json(response);
}

app.get('/movie', handleGetMovie);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    /* console.log(`Server listening at http://localhost:${PORT}`) */
});
