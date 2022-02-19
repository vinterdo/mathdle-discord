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

export default emojify;