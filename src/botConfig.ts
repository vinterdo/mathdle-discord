const signsNoDiv = ["+", "-", "*"];
const signs = [...signsNoDiv, "/"];
const numberNoZeroOne = ["2", "3", "4", "5", "6", "7", "8", "9"]
const numbersNoZero = ["1", ...numberNoZeroOne];
const numbersAll = [...numbersNoZero, "0"];
const allPossible = [...numbersAll, ...signs];

const green = "🟩";
const yellow = "🟨";
const gray = "🔳";
const black = "⬛"

const botConfig = {
    characters: {
        signsNoDiv,
        signs,
        numbersAll,
        numbersNoZero,
        numberNoZeroOne,
        allPossible
    },
    emoji: {
        green,
        yellow,
        gray,
        black
    }
}

export default botConfig;