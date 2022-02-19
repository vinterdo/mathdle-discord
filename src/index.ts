import {
    Client,
    Intents,
    Message,
} from "discord.js";
import {token} from "./config.json"
import handleNew from "./commands/handleNew";
import handleGuess from "./commands/handleGuess";
import handleReset from "./commands/handleReset";
import handleStatus from "./commands/handleStatus";
import handleHistory from "./commands/handleHistory";

const client = new Client({intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]});

client.once('ready', () => {
    console.log('Ready!');
});

client.on("messageCreate", (message: Message) => {
    const {content, channel} = message;
    if (content.toLowerCase().startsWith("!!new") || content.toLowerCase().startsWith("!!n")) {
        handleNew(channel, content);
    }
    if (content.toLowerCase() === "!!reset" || content.toLowerCase() === "!!r") {
        handleReset(channel);
    }
    if (content.toLowerCase() === "!!status" || content.toLowerCase() === "!!s") {
        handleStatus(channel);
    }
    if (content.toLowerCase() === "!!history" || content.toLowerCase() === "!!h") {
        handleHistory(channel);
    }
    if (content.toLowerCase().startsWith("!!guess") || content.toLowerCase().startsWith("!!g")) {
        handleGuess(channel, content, message);
    }
})

client.login(token);