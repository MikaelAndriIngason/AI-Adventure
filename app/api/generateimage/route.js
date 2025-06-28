import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt } = body;

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp-image-generation",
            generationConfig: {
                responseModalities: ['Text', 'Image'],
            },
        });

        const result = await model.generateContent(prompt);

        let imageBase64 = null;
        for (const part of result.response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
            imageBase64 = part.inlineData.data;
            break;
        }
        }

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image generated' }, { status: 500 });
        }

        return NextResponse.json({ image: `data:image/png;base64,${imageBase64}` });
    } catch (error) {
        console.error('Error in Gemini API call:', error);
        return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
    }
}
