import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Ensure dotenv.config() runs at the very top of this module
// so process.env.GEMINI_API_KEY is available when genAI is initialized.
if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const chatWithGemini = async (req, res) => {
    try {
        const { message } = req.body;

        // --- FIX: Changed model name to "gemini-2.0-flash" based on available models ---
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const result = await model.generateContent(message);
        const response = result.response.text();

        res.json({ reply: response });
    } catch (err) {
        console.error("Gemini error:", err);
        res.status(200).json({ reply: "Sorry, the AI couldn't respond at the moment. Please try again later." });

    }
};
