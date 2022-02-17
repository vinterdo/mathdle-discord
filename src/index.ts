import {Client, Intents, Message, User} from "discord.js";
import {token} from "./config.json"
// Create a new client instance
const client = new Client({intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]});

const prefix = "!!";

// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});

type GameStatus = {
    currentWord: string | null;
    guesses: number;
    history: {
        input: string;
        user: string;
    }[],
    won: User | null,
    startTime: Date | null
}

const green = "🟩";
const yellow = "🟨";
const gray = "🔳"

let status: GameStatus = {
    currentWord: null,
    guesses: 0,
    history: [],
    won: null,
    startTime: null
};

const countLetters = (word: string) => {
    const letterCounter: Record<string, number> = {};
    [...word].forEach((letter) => {
        if (!letterCounter[letter]) {
            letterCounter[letter] = 0;
        }
        letterCounter[letter] += 1;
    })
    return letterCounter;
}

const guessToMosaic = (guess: string, truth: string) => {
    const truthLetters = countLetters(truth);
    return [...guess].map((letter, index) => {
        if (truth.includes(letter)) {
            if (truth[index] === letter) {
                truthLetters[letter] -= 1;
                return green;
            }
            if (truthLetters[letter] > 0) {
                truthLetters[letter] -= 1;
                return yellow;
            }
        }
        return gray;
    }).join("");
}

const signs = ["+", "-", "*"];
const numbersNoZero = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const numbersAndZero = [...numbersNoZero, "0"];

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
        return sample(numbersNoZero);
    }
    if (length === 2) {
        return sample(numbersNoZero) + sample(numbersAndZero);
    }
    const [a, b] = sample(variants(length - 1));
    return generateTruth(a) + sample(signs) + generateTruth(b);
}

const emojify = (word: string) => {
    return [...word].map((letter) => {
        switch (letter) {
            case "0":
                return ":zero:";
            case "1":
                return ":one:";
            case "2":
                return ":two:";
            case "3":
                return ":three:";
            case "4":
                return ":four:";
            case "5":
                return ":five:";
            case "6":
                return ":six:";
            case "7":
                return ":seven:";
            case "8":
                return ":eight:";
            case "9":
                return ":nine:";
            case "+":
                return "<:plus:943986802740564028>";
            case "-":
                return "<:minus:943986802715414628>";
            case "*":
                return ":regional_indicator_x:";
        }
    }).join("");
}

client.on("messageCreate", (message: Message) => {
    if (!message.content.startsWith(prefix)) {
        return;
    }
    const {content, channel} = message;
    if (content.toLowerCase().startsWith("!!new") || content.toLowerCase().startsWith("!!n")) {
        if (status.currentWord && !status.won) {
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
        status = {
            currentWord: generateTruth(length),
            guesses: 0,
            history: [],
            won: null,
            startTime: new Date()
        }
        channel.send(`New game started! Expected result is ${eval(status.currentWord!)}`);
    }
    if (content.toLowerCase() === "!!reset" || content.toLowerCase() === "!!r") {
        channel.send("Game reset, use !!new to start new one")
        status = {
            currentWord: null,
            guesses: 0,
            history: [],
            won: null,
            startTime: null
        }
    }
    if (content.toLowerCase() === "!!help" || content.toLowerCase() === "!!h") {
        channel.send("no help for you!")
    }
    if (content.toLowerCase() === "!!status" || content.toLowerCase() === "!!s") {
        channel.send(`Guesses made: ${status.guesses}

History:
${status.history.map((entry) => `${guessToMosaic(entry.input, status.currentWord!)}\n${emojify(entry.input)} by ${entry.user}\n\n`).join("")}
`)
    }
    if (content.toLowerCase().startsWith("!!guess") || content.toLowerCase().startsWith("!!g")) {
        if (!status.currentWord) {
            channel.send("There is no game currently running!");
        }
        let [, guess] = content.split(" ");
        if (!guess) {
            return;
        }
        guess = guess.replaceAll("x", "*");
        if (!guess.match(/^[-0-9*+ x]+$/)) {
            channel.send("Invalid characters in guess!")
            return;
        }
        if (guess.length !== status.currentWord!.length) {
            channel.send("Guess has different length that desired equation!")
            return;
        }
        if (eval(guess) !== eval(status.currentWord!)) {
            channel.send("Result of guess does not match result of equation!")
            return;
        }
        const guessSanitized = guess.replaceAll(" ", "")
        if (guessSanitized === status.currentWord) {
            status.guesses += 1;
            status.history.push({input: guessSanitized, user: message.author.username})
            channel.send(`
${emojify(guess)}
${guessToMosaic(guess, status.currentWord!)}

${message.author.username} guessed correctly! 
It took ${status.guesses} guesses and ${(new Date().getTime() - status.startTime!.getTime()) / 1000} seconds
`)
            status.won = message.author;
            return;
        }
        status.guesses += 1;
        status.history.push({input: guessSanitized, user: message.author.username})
        channel.send(`${emojify(guess)} 
${guessToMosaic(guess, status.currentWord!)}`);
    }
})

// Login to Discord with your client's token
client.login(token);