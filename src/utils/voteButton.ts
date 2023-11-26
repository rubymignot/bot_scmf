import { ButtonInteraction, EmbedBuilder } from "discord.js";
import prisma from "../prismaClient"; // Adjust the path as necessary

export async function handleVoteButton(interaction: ButtonInteraction) {
  // Extract the necessary identifiers from the customId of the button
  const pollId = interaction.message.id;

  try {
    const poll = await prisma.poll.findUnique({
      where: { MessageId: pollId },
    });
    // Check if the poll is still open
    if (
      poll?.createdAt &&
      poll?.duree &&
      Date.now() > poll?.createdAt.getTime() + poll?.duree * 1000 * 3600
    ) {
      await interaction.reply({
        content: "Ce vote est terminé.",
        ephemeral: true,
      });
      return;
    }
    // Check if the user has already voted
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        pollId: pollId,
        discordId: interaction.user.id.toString(),
      },
    });
    // Update the vote count for the selected option in the database
    if (!existingVote) {
      await prisma.pollVote.create({
        data: {
          discordId: interaction.user.id.toString(),
          optionId: interaction.customId,
          poll: { connect: { MessageId: pollId } },
        },
      });
    } else {
      await interaction.reply({
        content: "Vous avez déjà voté.",
        ephemeral: true,
      });
      return;
    }
    // Send a confirmation message to the user
    await interaction.reply({
      content: "Votre vote a été enregistré ! Vous avez voté pour " + interaction.customId + ". Merci.",
      ephemeral: true,
    });
    if (!poll?.anonymous) {
      // Update the poll description to add a note that the user has voted
      const newText = `${poll?.description}\n<@${interaction.user.id}> a voté ${interaction.customId}.`;
      try {
        await prisma.poll.update({
          data: {
            description: `${newText}`,
          },
          where: { MessageId: pollId },
        });
      } catch (error) {
        console.error("Error updating poll description:", error);
        await interaction.reply({
          content:
            "Impossible de mettre à jour la description. Le vote a été enregistré.",
          ephemeral: true,
        });
      }
      // Update the poll message in Discord
      const embed = new EmbedBuilder()
        .setTitle(poll?.question || "Pas de question")
        .setDescription(newText)
        .setColor("#00ff00")
        .setTimestamp(poll?.createdAt)
        .setFooter({ text: `Vote créé par ${poll?.AuthorId}` });
      await interaction.message.edit({
        embeds: [embed],
        components: interaction.message.components,
      });
    }
  } catch (error) {
    console.error("Error handling vote button interaction:", error);
    await interaction.reply({
      content: "Erreur lors de l'enregistrement du vote.",
      ephemeral: true,
    });
  }
}
