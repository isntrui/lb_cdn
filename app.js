const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 1401;

app.use(cors());

const cache = new NodeCache({ stdTTL: 300 });

const checkCache = (req, res, next) => {
    const imageName = req.params.name;
    const cachedData = cache.get(imageName);

    if (cachedData) {
        console.log(`Serving from cache: ${imageName}`);
        return res.send(cachedData);
    }
    next();
};

app.get('/res/:name', checkCache, async (req, res) => {
    const imageName = req.params.name;
    const imageUrl = `https://storage.yandexcloud.net/lbs3/${imageName}`;

    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        res.set('Content-Type', response.headers['content-type']);
        res.set('Content-Length', response.headers['content-length']);

        cache.set(imageName, response.data);

        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching image: ${error.message}`);

        if (error.response) {
            res.status(error.response.status).send(`Error fetching image: ${error.response.statusText}`);
        } else {
            res.status(500).send('Internal Server Error');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});