import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ Error: GROQ_API_KEY is missing in .env file");
  process.exit(1);
}

// ====================== TTS ENDPOINT ======================
app.post('/tts', async (req, res) => {
  try {
    const { text, voice = "troy", speed = 1.0 } = req.body;

    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "Text is required" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "canopylabs/orpheus-v1-english",
        input: text,
        voice: voice,
        response_format: "wav",
        speed: parseFloat(speed)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API Error:", errorText);
      return res.status(response.status).json({ error: "Groq API failed", details: errorText });
    }

    const audioBuffer = await response.arrayBuffer();

    res.set({
      "Content-Type": "audio/wav",
      "Content-Disposition": "inline; filename=tts.wav"
    });

    res.send(Buffer.from(audioBuffer));

  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: "✅ Groq TTS Proxy is running!",
    usage: "POST /tts with { text, voice?, speed? }"
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Groq TTS Proxy running on http://localhost:${PORT}`);
  
});


