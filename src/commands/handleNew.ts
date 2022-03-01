import {DMChannel, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";
import botConfig from "../botConfig";
import {getState, setState} from "../state";
import {all, bignumber, create, e, evaluate, pow, random, randomInt, sqrt} from "mathjs";
import { unwatchFile } from "fs";

const config = {}
const math = create(all, config)

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

const divider = (n: number, l: number) => {
    const dividers : number[]= [];
    for (let index = 2; index < 10; index++) {
        if(n % index === 0) {
            dividers.push(index);
        }
    }
    if(dividers.length === 0) return false
    return dividers
}


const isSign = (n: string) => {
    return n === "*" || n === "/" || n === "+" || n === "-"
}

const generateTruth = (length: number): string => {
    let truth = ""
    let left = length - 1
    let last = ""
    let toDivide = ""
    toDivide = truth += sample(botConfig.characters.numbersNoZero)
    console.clear()
    while(left > 0){
        last = truth.slice(-1)
        console.log(`truth: ${truth}`)
        if(isSign(last)) {
            if(last === "/"){
                
                
                const add = divider(evaluate(toDivide.slice(0, toDivide.length - 1)), 1)
                console.log(`dividing ${toDivide.slice(0, toDivide.length - 1)} = ${evaluate(toDivide.slice(0, toDivide.length - 1))} by ${add}`)
                if(add != false){
                    truth += sample(add)
                }
                else {
                    truth = truth.slice(0, truth.length - 1) + sample(botConfig.characters.signsNoDiv)
                    toDivide = toDivide.slice(0, toDivide.length - 1)
                }
            }
            else truth += sample(botConfig.characters.numbersNoZero)
        }
        else truth += sample(botConfig.characters.signs)

        toDivide += truth.slice(-1)
        if(truth.slice(-1) === "+" || truth.slice(-1) === "-") toDivide = ""
        left--
        console.log(`left: ${left}`);
        
    }

    console.log(truth)
    return truth
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
    channel.send(`New game started! Expected result is ${evaluate(newTruth)}`);
}


export default handleNew;