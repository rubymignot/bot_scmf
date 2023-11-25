import {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  ButtonStyle,
  TextChannel,
  REST,
  Routes,
} from "discord.js";
import { handleCommands } from "./handlers/commands";
import { handleVoteButton } from "./utils/voteButton";
import prisma from "./prismaClient";
import creervote from "../discord/creervote";
import { checkTimestampsAndSendMessage } from "./utils/checkTimestamps";
require("dotenv").config();
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
const token = process.env.DISCORD_TOKEN;

const rest = new REST({ version: '9' }).setToken(token!);
const commands = [creervote.data];
rest.put(Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);

client.once("ready", () => {
  console.log("Ready!");
  setInterval(() => {
    checkTimestampsAndSendMessage(client);
  }, 300000);
});

client.on("messageCreate", (message) => {
  if (message.content === "ping") {
    message.channel.send("pong");
  }
});

client.on('interactionCreate', handleCommands);
client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await handleVoteButton(interaction);

    // Update the vote count in the message
    const pollId = interaction.message.id;
    const vote = await prisma.poll.findUnique({
      where: { MessageId: pollId },
      include: { PollVote: true }
    });
    const channel = interaction.channel as TextChannel;
    const message = await channel.messages.fetch(pollId);
  }
});

client.login(token);
