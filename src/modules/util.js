export function delayInMilliseconds(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function delayInSeconds(time) {
    return new Promise(resolve => setTimeout(resolve, time / 1000));
}