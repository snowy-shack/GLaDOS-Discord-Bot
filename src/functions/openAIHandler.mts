import OpenAI from "openai";
import {Message} from "discord.js";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.APIKEY,
});

const prompt = atob(String(process.env.PROMPT64));

export async function getGPTResponse(message: Message): Promise<string | null> {
    try {
        const completion = openai.chat.completions.create({
            model: "deepseek/deepseek-chat-v3-0324:free",
            store: true,
            messages: [
                {"role": "user", "content": prompt.replace(
                        "<NAME>", message.member?.nickname ?? message.member?.displayName ?? "subject"
                    ) + message.content},
            ],
        });

        const result = await completion;
        return result.choices[0].message.content;
    } catch (e) {
        console.error(e);
        return null;
    }
}