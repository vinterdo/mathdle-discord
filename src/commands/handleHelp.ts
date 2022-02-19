import {DMChannel, NewsChannel, PartialDMChannel, TextChannel, ThreadChannel} from "discord.js";

function handleHelp(channel: NewsChannel | TextChannel | ThreadChannel | DMChannel | PartialDMChannel) {
    channel.send("Command list:\n!!new *number* - creates a new game\n!!guess *equation* - make a guess\n!!reset - resets active game\n!!status - displays what you have learnt\n!!history - displays guess history");
    return
}

export default handleHelp;