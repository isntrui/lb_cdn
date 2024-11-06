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
        res.set('Content-Type', cachedData.contentType);
        return res.send(cachedData.data);
    }
    next();
};

app.get('/res/:name', checkCache, async (req, res) => {
    const fileName = req.params.name;
    const fileUrl = `https://storage.yandexcloud.net/lbs3/${fileName}`;

    try {
        const response = await axios.get(fileUrl, {
            responseType: 'arraybuffer'
        });

        const contentType = response.headers['content-type'];
        res.set('Content-Type', contentType);
        res.set('Content-Length', response.data.length);

        cache.set(fileName, { data: response.data, contentType });

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