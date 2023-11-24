import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  GuildMemberRoleManager,
} from "discord.js";
import { vote } from "./commands/backend/vote";
require("dotenv").config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
client.once("ready", () => {
  console.log("Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (interaction.commandName === "server") {
    await interaction.reply("Info du serveur.");
  }

  if (interaction.commandName === "vote") {
    let roles = (interaction?.member?.roles as GuildMemberRoleManager).cache;
    let isAuthorized = roles.some((role) => role.id === "1176048024846344284");
    if (isAuthorized) await vote(interaction);
    else await interaction.reply({content:"Vous n'avez pas la permission. :(\nDemandez à l'équipe des guides pour soumettre un vote.", ephemeral: true });
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "ping") {
    message.channel.send("pong");
  }
});

client.login(process.env.DISCORD_TOKEN);
