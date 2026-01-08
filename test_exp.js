
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) process.exit(1);

const genAI = new GoogleGenerativeAI(apiKey);

async function testHelp() {
    const models = [
        "gemini-2.0-flash-exp",
        "gemini-2.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash-lite-preview-02-05"
    ];

    for (const m of models) {
        try {
            console.log(`Trying ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            await model.generateContent("Hi");
            console.log(`PASS: ${m}`);
            // If we find one that passes (no 429, no 404), we can stop or list it.
        } catch (e) {
            console.log(`FAIL: ${m} -> ${e.message.split('\n')[0]}`);
        }
    }
}

testHelp();
