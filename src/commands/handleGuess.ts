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

    if(getState().won != null) {
        channel.send(`${getState().won} already won this game, use !!new to create a new one`);
        return;
    }

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
    let invalidGuess = false;
    [...guess].forEach((array) => {
        if (parseInt(array) < 10 || parseInt(array) > -1) hasNumbers = true;

    });

    [...guess].forEach((array) => {
        if (array === "/" || array === "x" || array === "*" || array === "+" || array === "-") {
            console.log(array, prevWasSign)
            if (!prevWasSign) prevWasSign = true;
            else {
                invalidGuess = true
            }
        } else prevWasSign = false

    });

    if(invalidGuess) {
        channel.send("Invalid guess!")
        return
    }

    if (hasNumbers) {
        if (math.evaluate(guess) !== math.evaluate(currentWord)) {
            channel.send(`This does not equal ${eval(currentWord)}!`)
            return;
        }
    } 
    else {
        channel.send("Guess has to have numbers in it!")
        return
    }

    const guessSanitized = guess.replaceAll(" ", "")
    if (guessSanitized === state.currentWord) {
        state.guesses += 1;
        state.history.push({input: guessSanitized, user: message.author})

        channel.send(`
${emojify(guess)}
${guessToMosaic(guess, state)}`);


    const time = Math.floor(new Date().getTime() - (state.startTime?.getTime() || 0)) / 1000;
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60; 

        channel.send(`${message.author.username} guessed correctly!
It took ${state.guesses} guesses for ${(minutes != 0) ? minutes + " minutes and " : ""}${math.round(seconds, 3)} seconds`)
        setState({
            currentWord: state.currentWord,
            guesses: state.guesses,
            history: state.history,
            won: message.author,
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