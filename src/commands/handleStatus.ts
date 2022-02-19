import {DMChannel, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";
import emojify from "../utils/emojify";
import {getState} from "../state";

function handleStatus(channel: NewsChannel | TextChannel | ThreadChannel | DMChannel | PartialDMChannel) {
    const state = getState();
    let toSend = ""

    if (state.currentWord) toSend += "Length: " + emojify(state.currentWord.length.toString()) + "   Result: " + emojify(eval(state.currentWord).toString()) + "\n"

    state.known.forEach((key, value) => {
        toSend += emojify(value)
    })

    toSend += "\n"

    state.known.forEach((key) => {
        toSend += key
    })

    if (toSend === "\n") toSend += "Create a new game!"

    channel.send(toSend)
}

export default handleStatus;