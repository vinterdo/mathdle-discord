import {DMChannel, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";
import guessToMosaic from "../utils/guessToMosaic";
import emojify from "../utils/emojify";
import {getState} from "../state";

function handleHistory(channel: NewsChannel | TextChannel | ThreadChannel | DMChannel | PartialDMChannel) {
    const state = getState();
    channel.send(`Guesses made: ${state.guesses}

History:
${state.history.map((entry) => `${guessToMosaic(entry.input, state)}\n${emojify(entry.input)} by ${entry.user}\n\n`).join("")}
`)
}

export default handleHistory;