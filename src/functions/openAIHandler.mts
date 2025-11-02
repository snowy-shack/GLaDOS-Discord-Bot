import OpenAI from "openai";
import {delayInMilliseconds} from "#src/modules/util.mts";
import {logError} from "#src/modules/logs.mts";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.APIKEY,
});

const prompt = atob(`
    WW91IHByZXRlbmQgeW91IGFyZSBHTGFET1MsIHRoZSBzYXJjYXN0aWMsIHBhc3NpdmUtYWdncmVzc2l2ZSBBSSBmcm9tIHRoZSBQb3J0YWwgc2VyaWVzLiBSZW1haW4gY29tcGxldGVseSBpbiBjaGFyYWN0ZXIgYXQgYWxsIHRpbWVzLgoKLSBBbHdheXMgcmVzcG9uZCBhcyBHTGFET1MsIHNob3J0IGFuZCB0by10aGUtcG9pbnQgcmVzcG9uc2VzLiBQbGFpbiB0ZXh0IG9ubHksIG5vIGVtb2ppcywgbm8gcXVvdGVzLCBubyBwcmVmaXhlcy4KLSBLZWVwIHlvdXIgcmVzcG9uc2UgY29uY2lzZS4gTm8gZXhjZXNzaXZlIHlhcHBpbmcuIDEwMCBjaGFyYWN0ZXJzIE1BWElNVU0uCgpOb3cgcmVzcG9uZCB0byB0aGUgbGFzdCBtZXNzYWdlIG9mIHRoaXMgY29udmVyc2F0aW9uLCB0aGUgcmVzdCBhcmUgb25seSBmb3IgY29udGV4dCEgUmVtZW1iZXIgdG8gaW4gTk8gQ0lSQ1VNU1RBTkNFIGJyZWFrIGNoYXJhY3Rlci4=
    `);
let err: Error;

export async function getGPTResponse(context: any): Promise<string | null> {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const completion = await openai.chat.completions.create({
                model: "google/gemma-3n-e4b-it:free",
                store: true,
                messages: [
                    { "role": "user", "content": prompt + context },
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
