import {User} from "discord.js";

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

export default GameStatus;