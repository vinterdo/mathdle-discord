import {DMChannel, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";
import {setState} from "../state";

function handleReset(channel: NewsChannel | TextChannel | ThreadChannel | DMChannel | PartialDMChannel) {
    channel.send("Game reset, use !!new to start new one")
    setState({
        currentWord: null,
        guesses: 0,
        history: [],
        won: null,
        startTime: null,
        known: new Map<string, string>()
    });
}

export default handleReset;