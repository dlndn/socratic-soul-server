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
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModelName = "gemini-1.5-flash";
const roleInstrEmotions = process.env.GEMINI_ROLE_INSTRUCTION_EMOTIONS;
const roleInstrRelationships = process.env.GEMINI_ROLE_INSTRUCTION_RELATIONSHIPS;

// middleware
app.use(cors());
app.use(express.json());

// config and settings for Gemini chatbot
const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
};

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];

// routes
app.get("/", (_req, res) => {
    res.send(`Welcome to Socratic Soul's server!`);
});

app.post("/init-chatbot", async (req, res) => {
    try {
        const chatTopic = req.body.topic;
    
        const model = genAI.getGenerativeModel({
            model: geminiModelName
        });
        
        const chat = model.startChat({
            generationConfig,
            safetySettings,
            history: []
        });
    
        const initialMsg = (chatTopic === "Emotions") ? roleInstrEmotions : roleInstrRelationships;
        const result = await chat.sendMessage(initialMsg);
        const response = await result.response;
        const text = response.text();
        res.send({
            user: initialMsg,
            model: text
        });
    } catch (error) {
        console.error(error);
        res.send(error);
    }
});

app.post("/chatbot", async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({
            model: geminiModelName
        });

        const chat = model.startChat({ 
            generationConfig,
            safetySettings,
            history: req.body.history 
        });

        const msg = req.body.message;
        const result = await chat.sendMessage(msg);
        const response = await result.response;
        const text = response.text();
        res.send(text);
    } catch (error) {
        console.error(error);
        res.send(error);
    }
});

app.all("*", (_req, res) => {
    res.status(404).send("Status 404: Resource not found.");
});

app.listen(PORT, () =>
    console.log(`Listening on port http://localhost:${PORT}`)
);
