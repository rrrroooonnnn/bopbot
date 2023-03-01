import { Client, Intents } from 'discord.js';
import BotState from './botState.js';
import lyricAPI from './API/lyricAPI.js';
const discordClient = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
const botState = new BotState({});

export function getState() {
    return botState;
}


export function bopBot(token) {
    discordClient.on('ready', () => {
        console.log(`Logged in as ${discordClient.user.tag}!`);
        console.log(`Bot State: ${JSON.stringify(botState)}`);
    });

    setTimeout(() => {
        const testServer = discordClient.channels.cache.get(process.env.MY_SERVER)
        testServer.send('I\'m alive.');
    }, 5000)


    discordClient.on('messageCreate', async (client) => {
        if (!client.author.bot) {
            await lyricAPI(botState, client);
        }
    });

    discordClient.login(token);

}

