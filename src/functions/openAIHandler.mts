import OpenAI from "openai";
import {delayInMilliseconds} from "#src/modules/util.mts";
import {logError} from "#src/modules/logs.mts";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.APIKEY,
});

let err: Error;

export async function getGPTResponse(prompt: string, context: string): Promise<string | null> {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const completion = await openai.chat.completions.create({
                model: "google/gemma-3n-e4b-it:free",
                store: true,
                messages: [
                    { "role": "user", "content": context },
                    { "role": "user", "content": prompt },
                ],
            });

            return completion.choices[0].message.content;
        } catch (e) {
            console.error(`Attempt ${attempt} failed:`, e);
            if (e instanceof Error) err = e;

            if (attempt < 3) {
                await delayInMilliseconds(1000 * attempt);
            }
        }
    }
    void logError("handling AI response", err);
    return null;
}
