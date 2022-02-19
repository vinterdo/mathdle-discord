import GameStatus from "./gameStatus";

const stateHolder: { state: GameStatus } = {
    state: {
        currentWord: null,
        guesses: 0,
        history: [],
        won: null,
        startTime: null,
        known: new Map<string, string>()
    }
};

export const setState = (newState: GameStatus) => {
    stateHolder.state = newState;
}

export const getState = () => stateHolder.state;