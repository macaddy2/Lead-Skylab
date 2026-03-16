import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('Hello');
        console.log('gemini-1.5-flash Success:', result.response.text());
    } catch (e) {
        console.error('gemini-1.5-flash Error:', e.message);
    }
    try {
        const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        const result2 = await model2.generateContent('Hello');
        console.log('gemini-1.5-pro Success:', result2.response.text());
    } catch (e) {
        console.error('gemini-1.5-pro Error:', e.message);
    }
    try {
        const model3 = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result3 = await model3.generateContent('Hello');
        console.log('gemini-pro Success:', result3.response.text());
    } catch (e) {
        console.error('gemini-pro Error:', e.message);
    }
}
test();
