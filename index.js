require('dotenv').config();
const PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(PORT, () => console.log(`Listening on port http://localhost:${PORT}`));