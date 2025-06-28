import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
    try {
        const body = await req.json();
        const { intro } = body;

        let prompt = intro;

        let systemInstruction = `You take a given description/intro, enhance it and create a roleplay intro (ai-dungeon style). You are setting up the story, not expanding it.
                                Instructions:
                                - Be specific, descriptive, and creative.
                                - Do not add any markdown or HTML to the text.
                                - Two paragraphs.
                                - Write in second person, directly addressing the player, so "You" and not "I".
                                - Do not end in a question.
                                - Set the scene with context: Begin by describing the world, and circumstances surrounding the character. This should be rooted in the time and place the character knows, detailing their life or what they are doing. Focus on the character's environment, personality, and typical experiences.`;

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction,
        });
        const generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: process.env.MAX_TOKENS_ENHANCE,
            responseMimeType: 'text/plain',
        };

        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });
        const result = await chatSession.sendMessage(prompt);
        const generatedText = result.response.text();

        return NextResponse.json({ text: generatedText });
    } catch (error) {
        console.error('Error in Gemini API call:', error);
        return NextResponse.json({ error: 'Error generating text' }, { status: 500 });
    }
}
