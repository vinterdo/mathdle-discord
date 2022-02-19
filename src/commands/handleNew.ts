import {DMChannel, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";
import botConfig from "../botConfig";
import {getState, setState} from "../state";

const sample = <T>(list: T[]) => {
    return list[Math.floor(Math.random() * list.length)];
}

const variants = (k: number) => {
    const result: [number, number][] = [];
    [...Array(k)].forEach((_, i) => {
        if (i === 0 || i === k) {
            return;
        }
        result.push([i, k - i]);
    })
    return result;
}

const generateTruth = (length: number): string => {
    if (length === 1) {
        return sample(botConfig.characters.numbersNoZero);
    }
    if (length === 2) {
        return sample(botConfig.characters.numbersNoZero) + sample(botConfig.characters.numbersAndZero);
    }
    const [a, b] = sample(variants(length - 1));
    const left = generateTruth(a);
    const right = generateTruth(b);
    let sign = sample(botConfig.characters.signs);
    if (sign === "/" && (parseInt(left) % parseInt(right)) != 0) sign = sample(botConfig.characters.signsNoDiv);
    return left + sign + right;
}

function handleNew(channel: NewsChannel | TextChannel | ThreadChannel | DMChannel | PartialDMChannel, content: string) {
    const state = getState();
    if (state.currentWord && !state.won) {
        channel.send("Game is ongoing, if you want to start new one, use !!reset")
        return;
    }
    const [, paramA] = content.split(" ");
    const length = parseInt(paramA);
    if (!length) {
        channel.send("Provide length of equation, e.g. !!new 5");
        return;
    }
    if (length <= 3) {
        channel.send("Too short game! Must be at least 4 characters long");
        return;
    }
    if (length > 100) {
        channel.send("Too long game! Must be at most 100 characters long");
        return;
    }
    const newTruth = generateTruth(length);
    setState({
        currentWord: newTruth,
        guesses: 0,
        history: [],
        won: null,
        startTime: new Date(),
        known: new Map<string, string>()
    });
    channel.send(`New game started! Expected result is ${eval(newTruth)}`);
}


export default handleNew;