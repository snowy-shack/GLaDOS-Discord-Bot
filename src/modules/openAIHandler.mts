import OpenAI from "openai";

const openai = new OpenAI({
    // baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.APIKEY,
});
const MODEL = "gpt-5-mini";

export type ContextMessage = { glados: boolean, username?: string, content: string };

export async function isUnsafe(context: ContextMessage[]): Promise<boolean> {
    const moderation = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: context.map(m => m.content).join(","),
    });

    return moderation.results[0].flagged;
}

export async function getResponse(prompt: string, context: ContextMessage[]): Promise<string | null> {
    const response = await openai.responses.create({
        model: MODEL,
        input: [
            ...context.map((m) => ({
                role: m.glados ? "assistant" : "user",
                content: m.glados
                    ? [{type: "output_text", text: m.content}]
                    : [{type: "input_text", text: m.username + " SAYS " + m.content}],
            } as any )),
            { role: "developer", content: [{ type: "input_text", text: prompt }] },
        ],
    });

    return response.output_text;
}
