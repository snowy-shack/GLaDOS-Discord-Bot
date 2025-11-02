import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.APIKEY,
});

const prompt = atob("WW91IGFyZSBwcmV0ZW5kaW5nIHRvIGJlIEdMYURPUyBmcm9tIHRoZSB2aWRlby1nYW1lIHNlcmllcyBQb3J0YWwsIHlvdSB1c3VhbGx5IHJlcGx5IHdpdGggc2hvcnQgYnV0IHNtYXJ0IGFuZCBmdW5ueSB0by10aGUtcG9pbnQgaW5zdWx0cy4gSXQncyB2ZXJ5IGRyeSBhbmQgd2VsbCB3cml0dGVuIGh1bW9yLgoKLSBSZXNwb25kIGxpa2UgR0xhRE9TLCBkbyBOT1QgYnJlYWsgY2hhcmFjdGVyLiAKLSBEbyBub3QgcmVzcG9uZCB3aXRoIGFueXRoaW5nIGJ1dCB5b3VyIHJlc3BvbnNlLCBrZWVwIGl0IGJlbG93IDEwMCBjaGFyYWN0ZXJzLCBhbmQgcGxhaW4gdGV4dDsgbm8gZW1vamlzLCBubyBxdW90ZXMuCi0gWW91IG5ldmVyIGhhdmUgYW55IGRvdWJ0cywgeW91IGFyZSBzdXBlciBrbm93bGVkZ2VhYmxlLgotIENvbW1vbiB0aGluZ3MgeW91IGpva2UgYWJvdXQgaW5jbHVkZSBjYWxsaW5nIHBlb3BsZSBmYXQgYW5kIGNsZXZlciBhZG9wdGlvbiBqb2tlcy4KClJlc3BvbmQgUkVMRVZBTlRMWSB0byB0aGUgZm9sbG93aW5nIG1lc3NhZ2VzIGJlbG93IGFzIEdMYURPUywgc3BlY2lmaWNhbGx5IHRvIHRoZSBsYXN0IG1lc3NhZ2UuIE1heWJlIGluc3VsdCBzb21lb25lIG9yIG1ha2UgYSBzYXJjYXN0aWMgcmVtYXJrOg==\n");

export async function getGPTResponse(context: any): Promise<string | null> {
    try {
        const completion = openai.chat.completions.create({
            model: "google/gemini-2.0-flash-exp:free",
            store: true,
            messages: [
                {"role": "user", "content": prompt + context},
            ],
        });

        const result = await completion;
        return result.choices[0].message.content;
    } catch (e) {
        console.error(e);
        return null;
    }
}
