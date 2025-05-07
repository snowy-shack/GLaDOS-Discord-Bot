import {Message} from "discord.js";

export function onCountingMessage(message: Message): void {
    maybeSendMessage(message);
}

function maybeSendMessage(message: Message): void {
    const captured = message.content.match(/^(\d+)$/);

    // One in 500
    if (captured && (Math.random() * 500 < 1 || ( Math.random() * 5 < 1 && captured[1].endsWith("999"))) ) {
        const channel = message.channel;
        if ("send" in channel) {
            channel.send(`${Number(captured[1]) + 1} :)`);
        }
    }
}
