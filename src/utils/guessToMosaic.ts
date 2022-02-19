import botConfig from "../botConfig";
import GameStatus from "../gameStatus";


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

const guessToMosaic = (guess: string, status: GameStatus) => {

    const truth = status.currentWord;
    if (!truth) {
        throw Error("Do not call guessToMosaic when there is no game ongoing");
    }
    botConfig.characters.allPossible.forEach((arr) => {
        if (status.known.get(arr) != botConfig.emoji.green && status.known.get(arr) != botConfig.emoji.yellow && status.known.get(arr) != botConfig.emoji.gray) status.known.set(arr, botConfig.emoji.black)
    })
    const truthLetters = countLetters(truth);
    const mosaic: string[] = [];
    [...guess].forEach((letter, index) => {
        mosaic[index] = botConfig.emoji.gray;
    });
    [...guess].forEach((letter, index) => {
        if (truth[index] === letter) {
            mosaic[index] = botConfig.emoji.green;
            truthLetters[letter] -= 1;
            status.known.set(letter, botConfig.emoji.green)
        }
    });
    [...guess].forEach((letter, index) => {
        if (truth.includes(letter) && truthLetters[letter] > 0 && mosaic[index] === botConfig.emoji.gray) {
            mosaic[index] = botConfig.emoji.yellow;
            truthLetters[letter] -= 1;
            if (status.known.get(letter) === botConfig.emoji.black) status.known.set(letter, botConfig.emoji.yellow)
        }
    });
    [...guess].forEach((Array) => {
        if (status.known.get(Array) === botConfig.emoji.black) status.known.set(Array, botConfig.emoji.gray)
    })
    return mosaic.join("")
}

export default guessToMosaic;