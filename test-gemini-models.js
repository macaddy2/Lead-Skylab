import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        console.log('Fetching models with key:', apiKey.substring(0, 10) + '...');
        // Node 18+ uses native fetch. Just fetching the REST endpoint for models
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}
listModels();
