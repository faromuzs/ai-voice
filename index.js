import express from 'express';
import cors from 'cors';
import { Groq } from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY 
});

app.post('/tts', async (req, res) => {
    try {
        const { text, voice = 'troy' } = req.body;

        if (!text) {
            return res.status(400).json({ error: "Text is required" });
        }

        const response = await groq.audio.speech.create({
            model: "canopylabs/orpheus-v1-english",
            voice: voice,
            input: text,
            response_format: "mp3",
        });

        const buffer = Buffer.from(await response.arrayBuffer());

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Length', buffer.length);
        res.send(buffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate TTS" });
    }
});

// Important: Use Render's PORT environment variable
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Groq TTS Server running on port ${PORT}`);
    console.log(`✅ TTS Endpoint: http://localhost:${PORT}/tts`);
});
