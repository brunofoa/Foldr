
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) process.exit(1);

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
        const result = await model.generateContent("Hello 2.0");
        console.log("Response:", result.response.text());
        console.log("SUCCESS");
    } catch (e) {
        console.log("FAIL:", e.message);
    }
}
test();
