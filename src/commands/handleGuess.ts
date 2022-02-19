import {DMChannel, Message, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";
import emojify from "../utils/emojify";
import guessToMosaic from "../utils/guessToMosaic";
import {all, create} from "mathjs";
import {getState, setState} from "../state";

const config = {}
const math = create(all, config)

function handleGuess(channel: NewsChannel | TextChannel | ThreadChannel | DMChannel | PartialDMChannel, content: string, message: Message) {
    const state = getState();
    if (!state.currentWord) {
        channel.send("There is no game currently running!");
        return
    }
    const currentWord: string = state.currentWord;
    let [, guess] = content.split(" ");
    if (!guess) {
        channel.send("Input some guess!");
        return;
    }
    guess = guess.replaceAll("x", "*").replaceAll(":", "/");

    if (!guess.match(/^[-0-9*+ x/]+$/)) {
        channel.send("Invalid characters in guess!")
        return;
    }
    if (guess.length > currentWord.length) {
        channel.send(`Guess is too long, the answer has ${currentWord.length} symbols!`)
        return;
    }
    if (guess.length < currentWord.length) {
        channel.send(`Guess is too short, the answer has ${currentWord.length} symbols!`)
        return;
    }
    let hasNumbers = false
    let prevWasSign = false;
    [...guess].forEach((Array) => {
        if (parseInt(Array) < 10 || parseInt(Array) > -1) hasNumbers = true;

    });

    [...guess].forEach((array) => {
        if (array === "/" || array === "x" || array === "*" || array === "+" || array === "-") {
            console.log(array);

            if (!prevWasSign) prevWasSign = true;
            else {
                channel.send("Invalid guess!")
                return
            }
        } else prevWasSign = false

    });

    if (hasNumbers) {
        if (math.evaluate(guess) !== math.evaluate(currentWord)) {
            channel.send(`This does not equal ${eval(currentWord)}!`)
            return;
        }
    } else {
        channel.send("Guess has to have numbers in it!")
        return
    }

    const guessSanitized = guess.replaceAll(" ", "")
    if (guessSanitized === state.currentWord) {
        state.guesses += 1;
        state.history.push({input: guessSanitized, user: message.author})

        channel.send(`
${emojify(guess)}
${guessToMosaic(guess, state)}`)

        channel.send(`${message.author.username} guessed correctly!
It took ${state.guesses} guesses and ${(Math.floor(new Date().getTime() - (state.startTime?.getTime() || 0)) / 1000)} seconds
`)
        setState({
            currentWord: state.currentWord,
            guesses: state.guesses,
            history: state.history,
            won: null,
            startTime: null,
            known: new Map<string, string>()
        });
        return;
    }
    state.guesses += 1;
    state.history.push({input: guessSanitized, user: message.author})
    channel.send(`${emojify(guess)} 
${guessToMosaic(guess, state)}`);
}

export default handleGuess;