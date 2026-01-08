
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual env parsing
const envPath = path.resolve('.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].trim() : null;

if (!apiKey) {
    fs.writeFileSync('model_status.txt', 'ERROR: No API Key found in .env.local');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelsFromDocs = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.5-pro-001",
    "gemini-1.5-pro-002",
    "gemini-1.0-pro",
    "gemini-pro"
];

async function check() {
    let output = "Checking Models:\n";

    for (const modelName of modelsFromDocs) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Simple prompt, no json schema constraint for this test to rule out schema issues
            await model.generateContent("Test");
            output += `[PASS] ${modelName}\n`;
        } catch (e) {
            output += `[FAIL] ${modelName}: ${e.message.split('\n')[0]}\n`;
        }
    }

    fs.writeFileSync('model_status.txt', output);
}

check();
