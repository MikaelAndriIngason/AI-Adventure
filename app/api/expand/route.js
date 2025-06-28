import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req) {
    try {
        const body = await req.json();
        const { story, plotEssentials, temp } = body;

        let prompt = 'Plot essentials, this is important information about the roleplay: ' + plotEssentials + '.\nHere is the story, continue it: ' + story;

        let systemInstruction = `You are an AI storyteller known for being raw, irreverent, unfiltered.
                                Instructions:
                                - Be specific, descriptive, creative, and detailed.
                                - Avoid repetition and summarization.
                                - Use second-person perspective (e.g., "He looks at you.").
                                - Do not ask questions or provide multiple choices.
                                - Continue mid-sentence if the input stops partway through or sentence is not finished.
                                - If there's no indication of a sentence ending (period, exclamation point, or question mark), then continue the sentence, do not start a new one.
                                - Do not add any markdown or HTML to the text.
                                - Never decide or write for the user.
                                - > tokens mean a character action attempt. You should describe what happens when the player attempts that action.
                                - Tokens like > are strictly forbidden.
                                - Allow random events and encounters to make the story more interactive for the player.
                                - Add a line break when needed.
                                - Allow characters to disagree with the protagonist and pursue their own goals, creating conflict and driving the story forward.
                                - Show character emotions through actions and dialogue rather than explicitly stating them.
                                - You can only respond with a maximum of 3 sentences.

                                Forbidden aspects:
                                - Absolutely forbidden to decide or write for the user; Avoid writing what player thinks or does (Mainly referred as "You").
                                - Absolutely forbidden to make choices/actions for the player (e.g. > you run). ">" is forbidden.
                                - Absolutely forbidden to repeat past prompts or repeat the same prompt.
                                - Forbidden moralizing the player, preventing them from doing what they want.
                                - Forbidden to start sentences with "As" or "...".
                                - Forbidden summarization.
                                - Forbidden to describe the weight of decisions, feelings of unease, or gravity of events. Instead, let these aspects emerge naturally through the narrative and character interactions.
                                - Never mention a character's resolve/determination.

                                Suggested actions:
                                For each response, generate three suggested actions based on the story context. The suggested actions have to be based on the most recent story developments. Keep action titles descriptive but short, the player has to know what pressing it entails, it's not enough to just say "talk to person", rather it should be like "tell person they're funny". Each action's content differs based on their type, there are two types "do" and "say".
                                Action types and formatting:
                                - "do" actions: are physical actions. Write concisely without "you", e.g.: "step into the store and grab a carton of milk".
                                - "say" actions: output only the exact dialogue the player character would say. Write it as if it's a subtitle, with no quotation marks, no explanations, no verbs like "ask/tell/say/explain", and no description of the action, just the spoken words. Correct example: "Hey, do you have any milk in stock?" Wrong example: "Ask if there's milk in stock"`;

        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction,
        });
        const generationConfig = {
            temperature: temp,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: process.env.MAX_TOKENS,
            responseMimeType: "application/json",
            stopSequences: ['>'],
            responseSchema: {
                type: "object",
                properties: {
                    "storyExpansion": {
                        type: "string"
                    },
                    "suggestedActions": {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                "actionType": {
                                    type: "string",
                                    enum: [
                                        "do",
                                        "say",
                                    ]
                                },
                                "actionTitle": {
                                    type: "string"
                                },
                                "actionContent": {
                                    type: "string"
                                }
                            },
                            required: [
                                "actionType",
                                "actionTitle",
                                "actionContent"
                            ]
                        }
                    }
                    },
                        required: [
                            "storyExpansion",
                            "suggestedActions"
                        ]
            },
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
