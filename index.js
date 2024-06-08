require('dotenv').config();
const PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = "gemini-1.5-flash";

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
    res.send(`Welcome to Socratic Soul's server!`);
});

app.post('/chatbot', async (req, res) => {
    const model = genAI.getGenerativeModel({ model: geminiModel });

    const chat = model.startChat({ history: req.body.history });
    const msg = req.body.message;

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
});

app.all("*", (_req, res) => {
    res.status(404).send('Status 404: Resource not found.');
})

app.listen(PORT, () => console.log(`Listening on port http://localhost:${PORT}`));