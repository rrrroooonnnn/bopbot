import { bopBot, getState } from './bopBot.js';
import dotenv from 'dotenv';
import http from "http"

import { readFile } from 'fs/promises';
let startUpTime = null;
dotenv.config()



const server = http.createServer(async (req, res) => {

    if (req.url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/html',
        });
        const getIndexHtml = await readFile('index.html');
        res.end(getIndexHtml);
    }

    if (req.url === '/bot-info') {
        const botState = getState();
        const dataString = JSON.stringify({ BotState: botState, LastDeployment: startUpTime });

        res.write(dataString);
        res.end();
    }
});



server.listen(5050, () => {
    console.log('Ready.');
    startUpTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    console.log(`Server Start: ${startUpTime}`);
    bopBot(process.env.BotToken);
})
