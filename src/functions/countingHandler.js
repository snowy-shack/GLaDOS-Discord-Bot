export function onCountingMessage(message) {
    maybeSendMessage(message);

    // more
}

function maybeSendMessage(message) {
    const captured = message.content.match(/^(\d+)$/);

    // One in 500
    if (captured && (Math.random() * 5 < 1 || captured[1].endsWith("999"))) {
        message.channel.send(`${Number(captured[1]) + 1} :)`);
    }
}
