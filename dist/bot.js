"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const vote_1 = require("./commands/backend/vote");
require("dotenv").config();
const client = new discord_js_1.Client({
    intents: [discord_js_1.GatewayIntentBits.Guilds, discord_js_1.GatewayIntentBits.GuildMessages],
});
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
client.once("ready", () => {
    console.log("Ready!");
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    if (interaction.commandName === "ping") {
        await interaction.reply("Pong!");
    }
    if (interaction.commandName === "server") {
        await interaction.reply("Info du serveur.");
    }
    if (interaction.commandName === "vote") {
        let roles = (interaction?.member?.roles).cache;
        let isAuthorized = roles.some((role) => role.id === "1176048024846344284");
        if (isAuthorized)
            await (0, vote_1.vote)(interaction);
        else
            await interaction.reply("Vous n'avez pas la permission. :(\nDemandez à l'équipe des guides pour soumettre un vote.");
    }
});
client.on("messageCreate", (message) => {
    if (message.content === "ping") {
        message.channel.send("pong");
    }
});
client.login(process.env.DISCORD_TOKEN);
