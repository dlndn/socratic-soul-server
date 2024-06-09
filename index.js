// .env setup
const dotenv = require("dotenv");
const dotenvExpand = require('dotenv-expand');
const config = dotenv.config();
dotenvExpand.expand(config);

// express + cors setup
const PORT = process.env.PORT || 8080;
const express = require("express");
const app = express();
const cors = require("cors");

// Gemini API setup
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModelName = "gemini-1.5-flash";
const roleInstrEmotions = process.env.GEMINI_ROLE_INSTRUCTION_EMOTIONS;
const roleInstrRelationships = process.env.GEMINI_ROLE_INSTRUCTION_RELATIONSHIPS;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.get("/", (_req, res) => {
    res.send(`Welcome to Socratic Soul's server!`);
});

app.post("/init-chatbot", async (req, res) => {
    const chatTopic = req.body.topic;

    const model = genAI.getGenerativeModel({
        model: geminiModelName
    });
    
    const chat = model.startChat();
    const initialMsg = (chatTopic === "Emotions") ? roleInstrEmotions : roleInstrRelationships;
    
    const result = await chat.sendMessage(initialMsg);
    const response = await result.response;
    const text = response.text();
    res.send({
        user: initialMsg,
        model: text
    });
});

app.post("/chatbot", async (req, res) => {
    const model = genAI.getGenerativeModel({
        model: geminiModelName
    });

    const chat = model.startChat({ history: req.body.history });
    const msg = req.body.message;

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    res.send(text);
});

app.all("*", (_req, res) => {
    res.status(404).send("Status 404: Resource not found.");
});

app.listen(PORT, () =>
    console.log(`Listening on port http://localhost:${PORT}`)
);
