import {Client, Intents, Message, User} from "discord.js";
import {create, all} from 'mathjs'


import {token} from "./config.json"

const config = {}
const math = create(all, config)

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
        user: User;
    }[],
    won: User | null,
    startTime: Date | null,
    known: Map<string, string>
}

const green = "🟩";
const yellow = "🟨";
const gray = "🔳";
const black = "⬛"

const signsNoDiv = ["+", "-", "*"];
const signs = [...signsNoDiv, "/"];
const numbersNoZero = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const numbersAndZero = [...numbersNoZero, "0"];
const allPossible = [...numbersAndZero, ...signs];


let status: GameStatus = {
    currentWord: null,
    guesses: 0,
    history: [],
    won: null,
    startTime: null,
    known: new Map<string, string>()
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

    allPossible.forEach((Array) => {
        if (status.known.get(Array) != green && status.known.get(Array) != yellow && status.known.get(Array) != gray) status.known.set(Array, black)
    })
    const truthLetters = countLetters(truth);
    let mosaic: string[] = [];
    [...guess].forEach((letter, index) => {
        mosaic[index] = gray;
    });
    [...guess].forEach((letter, index) => {
        if (truth[index] === letter) {
            mosaic[index] = green;
            truthLetters[letter] -= 1;
            status.known.set(letter, green)
        }
    });
    [...guess].forEach((letter, index) => {
        if (truth.includes(letter) && truthLetters[letter] > 0 && mosaic[index] === gray) {
            mosaic[index] = yellow;
            truthLetters[letter] -= 1;
            if (status.known.get(letter) === black) status.known.set(letter, yellow)
        }
    });
    [...guess].forEach((Array) => {
        if (status.known.get(Array) === black) status.known.set(Array, gray)
    })
    return mosaic.join("")
}

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
    let left = generateTruth(a);
    let right = generateTruth(b);
    let sign = sample(signs);
    if (sign === "/" && (parseInt(left) % parseInt(right)) != 0) sign = sample(signsNoDiv);
    return left + sign + right;
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
            case "/":
                return ":french_bread:";
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
            startTime: new Date(),
            known: new Map<string, string>()
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
            startTime: null,
            known: new Map<string, string>()
        }
    }
    if (content.toLowerCase() === "!!debug" || content.toLowerCase() === "!!d") {
        channel.send(`${status.currentWord}`)
    }
    if (content.toLowerCase() === "!!status" || content.toLowerCase() === "!!s") {
        let toSend = ""

        if (status.currentWord != null) toSend += "Length: " + emojify(status.currentWord.length.toString()) + "   Result: " + emojify(eval(status.currentWord!).toString()) + "\n"

        status.known.forEach((key, value) => {
            toSend += emojify(value)
        })

        toSend += "\n"

        status.known.forEach((key) => {
            toSend += key
        })

        if (toSend === "\n") toSend += "Create a new game!"

        channel.send(toSend)
    }
    if (content.toLowerCase() === "!!history" || content.toLowerCase() === "!!h") {
        channel.send(`Guesses made: ${status.guesses}

History:
${status.history.map((entry) => `${guessToMosaic(entry.input, status.currentWord!)}\n${emojify(entry.input)} by ${entry.user}\n\n`).join("")}
`)
    }
    if (content.toLowerCase().startsWith("!!guess") || content.toLowerCase().startsWith("!!g")) {
        if (!status.currentWord) {
            channel.send("There is no game currently running!");
            return
        }
        let [, guess] = content.split(" ");
        if (!guess) {
            channel.send("Input some guess!");
            return;
        }
        guess = guess.replaceAll("x", "*").replaceAll(":", "/");

        if (!guess.match(/^[-0-9*+ x\/]+$/)) {
            channel.send("Invalid characters in guess!")
            return;
        }
        if (guess.length > status.currentWord!.length) {
            channel.send(`Guess is too long, the answer has ${status.currentWord!.length} symbols!`)
            return;
        }
        if (guess.length < status.currentWord!.length) {
            channel.send(`Guess is too short, the answer has ${status.currentWord!.length} symbols!`)
            return;
        }
        let hasNumbers = false
        let prevWasSign = false;
        [...guess].forEach((Array) => {
            if (parseInt(Array) < 10 || parseInt(Array) > -1) hasNumbers = true;

        });

        [...guess].forEach((Array) => {
            if (Array === "/" || Array === "x" || Array === "*" || Array === "+" || Array === "-") {
                console.log(Array);

                if (!prevWasSign) prevWasSign = true;
                else {
                    channel.send("Invalid guess!")
                    return
                }
            } else prevWasSign = false

        });


        if (hasNumbers) {
            if (math.evaluate(guess) !== math.evaluate(status.currentWord!)) {
                channel.send(`This does not equal ${eval(status.currentWord!)}!`)
                return;
            }
        } else {
            channel.send("Guess has to have numbers in it!")
            return
        }

        const guessSanitized = guess.replaceAll(" ", "")
        if (guessSanitized === status.currentWord) {
            status.guesses += 1;
            status.history.push({input: guessSanitized, user: message.author})

            channel.send(`
${emojify(guess)}
${guessToMosaic(guess, status.currentWord!)}`)

            channel.send(`${message.author.username} guessed correctly!
It took ${status.guesses} guesses and ${(Math.floor(new Date().getTime() - status.startTime!.getTime()) / 1000)} seconds
`)
            status = {
                currentWord: status.currentWord,
                guesses: status.guesses,
                history: status.history,
                won: null,
                startTime: null,
                known: new Map<string, string>()
            }
            return;
        }
        status.guesses += 1;
        status.history.push({input: guessSanitized, user: message.author})
        channel.send(`${emojify(guess)} 
${guessToMosaic(guess, status.currentWord!)}`);
    }
})

// Login to Discord with your client's token
client.login(token);