import {
  ActionRowBuilder,
  ButtonBuilder,
  CommandInteraction,
  EmbedBuilder,
  ButtonStyle,
} from "discord.js";
import prisma from "../prismaClient";

export default async function creervote(interaction: CommandInteraction) {
  const options = [
    {
      name: "option1",
      value: interaction.options.get("option1")?.value || "Pas d'option",
      customId: interaction.options,
    },
    {
      name: "option2",
      value: interaction.options.get("option2")?.value || "Pas d'option",
    },
    {
      name: "option3",
      value: interaction.options.get("option3")?.value || "Pas d'option",
    },
    {
      name: "option4",
      value: interaction.options.get("option4")?.value || "Pas d'option",
    },
    {
      name: "option5",
      value: interaction.options.get("option5")?.value || "Pas d'option",
    },
    {
      name: "option6",
      value: interaction.options.get("option6")?.value || "Pas d'option",
    },
  ];
  const question = interaction.options.get("question");
  const duree = interaction.options.get("duree");
  if (duree?.value === 0) {
    await interaction.reply({
      content: "La durée du vote doit être supérieure à 0.",
      ephemeral: true,
    });
    return;
  }
  const description = "Cliquez sur les boutons pour voter.\nLe vote durera " + duree?.value + " heures.\n";
  const channelId = interaction.channel;
  const anonymous = interaction.options.get("anonyme")?.value || false;
  const date = new Date().getTime();
  const embed = new EmbedBuilder()
    .setTitle(`${question?.value?.toString()} - Vote ${anonymous ? "anonyme" : "public"}` || "Pas de question")
    .setDescription(description)
    .setColor("#00ff00")
    .setTimestamp(date)
    .setFooter({ text: `Vote créé par ${interaction.user.globalName}.` });
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    options
      .filter((option) => option.value !== "Pas d'option")
      .map((option) => {
        return new ButtonBuilder()
          .setCustomId(option.value.toString())
          .setLabel(option.value.toString())
          .setStyle(ButtonStyle.Primary);
      })
  );
  const reply = await interaction.reply({
    embeds: [embed],
    components: [row],
  });

  // Step 1: Create the Poll record
  try {
    const poll = await prisma.poll.create({
      data: {
        createdAt: new Date(date),
        description: description,
        ChannelId: channelId?.toString() || "Erreur",
        MessageId: reply?.id || "Erreur",
        question: question?.value?.toString() || "Erreur",
        duree: Number(duree?.value) || 0,
        AuthorId: interaction.user.globalName?.toString() || "Erreur",
        anonymous: anonymous.toString().toLowerCase() === "true" ? true : false,
      },
    });
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "Une erreur est survenue.",
      ephemeral: true,
    });
  }
  return;
}
