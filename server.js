// server.js
const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai'); // <-- Import GoogleGenAI

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Initialize the GoogleGenAI client. 
// It automatically uses the GEMINI_API_KEY from process.env (or GOOGLE_API_KEY).
// We explicitly pass the key name used in the .env file for clarity.
const ai = new GoogleGenAI({}); 

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Calls the Gemini API to generate a detailed travel itinerary.
 * @param {string} city - The destination city.
 * @param {number} duration - The duration of stay in days.
 * @returns {Promise<string>} The generated itinerary as a markdown string.
 */
async function generateItinerary(city, duration) {
    const prompt = `You are a world-class travel agent. Create a detailed, day-by-day itinerary for a ${duration}-day trip to ${city}. The itinerary must be formatted using **Markdown** for readability. Include suggested activities for morning, afternoon, and evening for each day.`;
    
    // Call the Gemini API
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // Fast and capable model for high-quality text generation
        contents: prompt,
    });

    // The generated text is in response.text
    return response.text;
}

// API endpoint to get the itinerary
app.post('/api/itinerary', async (req, res) => {
    const { city, duration } = req.body;

    if (!city || !duration) {
        return res.status(400).json({ error: 'City and duration are required.' });
    }

    try {
        // CALL THE REAL LLM FUNCTION
        const itinerary = await generateItinerary(city, duration);
        res.json({ itinerary: itinerary });

    } catch (error) {
        console.error('AI Agent error:', error.message);

        // Simple error handling for demonstration
        let status = 500;
        let message = 'Failed to generate itinerary. Check server logs.';
        
        // Note: Error structure for the Google Gen AI SDK is slightly different
        // but a general try-catch is sufficient here.
        
        res.status(status).json({ error: message });
    }
});

app.listen(port, () => {
    console.log(`AI Travel Agent listening at http://localhost:${port}`);
});