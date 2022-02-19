const signsNoDiv = ["+", "-", "*"];
const signs = [...signsNoDiv, "/"];
const numbersNoZero = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
const numbersAndZero = [...numbersNoZero, "0"];
const allPossible = [...numbersAndZero, ...signs];

const green = "🟩";
const yellow = "🟨";
const gray = "🔳";
const black = "⬛"

const botConfig = {
    characters: {
        signsNoDiv,
        signs,
        numbersNoZero,
        numbersAndZero,
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