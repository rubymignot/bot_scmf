import {
  SlashCommandBuilder,
} from "discord.js";

const command = new SlashCommandBuilder()
.setName("creervote")
.setDescription("Crée un vote")
.addStringOption(option => option.setName("question").setDescription("La question a poser").setRequired(true))
.addIntegerOption(option => option.setName("duree").setDescription("La duree du vote en heures").setRequired(true))
.addStringOption(option => option.setName("option1").setDescription("Options de vote").setRequired(true))
.addStringOption(option => option.setName("option2").setDescription("Options de vote").setRequired(true))
.addStringOption(option => option.setName("option3").setDescription("Options de vote").setRequired(false))
.addStringOption(option => option.setName("option4").setDescription("Options de vote").setRequired(false))
.addStringOption(option => option.setName("option5").setDescription("Options de vote").setRequired(false))
.addStringOption(option => option.setName("option6").setDescription("Options de vote").setRequired(false))

export default {
  data: command.toJSON(),
};
