const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 1488;

app.use(cors());

app.get('/image/:name', async (req, res) => {
    const imageName = req.params.name;
    const imageUrl = `https://storage.yandexcloud.net/lbs3/${imageName}`;

    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer'
        });

        res.set('Content-Type', response.headers['content-type']);
        res.set('Content-Length', response.headers['content-length']);
        res.send(response.data);
    } catch (error) {
        console.error(`Error fetching image: ${error.message}`);
        res.status(404).send('Image not found');
    }
});
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});