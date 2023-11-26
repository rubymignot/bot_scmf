import { Client, EmbedBuilder, TextChannel } from "discord.js";
import prisma from "../prismaClient";

export async function checkTimestampsAndSendMessage(discordClient: Client) {
  const currentTime = new Date();

  console.log(
    `[${new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "")}] Checking vote timestamps.`
  );

  const polls = await prisma.poll.findMany({
    include: { PollVote: true },
  });

  for (const poll of polls) {
    const expirationTime = new Date(
      poll.createdAt.getTime() + poll.duree * 3600000
    );

    if (currentTime >= expirationTime) {
      try {
        const channelId = poll.ChannelId.replace(/<#|>/g, "");
        const channel = (await discordClient.channels.fetch(
          channelId
        )) as TextChannel;
        if (channel) {
          try {
            console.log(
              `Poll "${poll.question}" ended. Sending results for poll to channel: ${channel.name}`
            );
            const message = await channel.messages.fetch(poll.MessageId);
            const results = compilePollResults(poll.PollVote);
            const messageResults = await message.reply(
              `Le vote pour la question "**${poll.question}**" est terminé. \n\nRésultats : \n${results}`
            );
            // Update the poll description to add the results
            const description = poll.description
              .replace("Cliquez sur les boutons pour voter.\n", "")
              .replace("Le vote durera " + poll.duree + " heures.\n\n", "");
            const newDescription = `${description}\n\nLe vote a duré ${poll.duree} heures.\nVoir les résultats ci-dessous. Merci d'avoir voté !\n${messageResults.url}`;

            // Update the poll message in Discord
            const anonymous = poll.anonymous;
            const question = poll.question;
            const embed = new EmbedBuilder()
              .setTitle(
                `${question?.toString()} - Vote ${
                  anonymous ? "anonyme" : "public"
                }` || "Pas de question"
              )
              .setDescription(newDescription)
              .setColor("#00ff00")
              .setTimestamp(poll?.createdAt)
              .setFooter({ text: `Vote créé par ${poll?.AuthorId}` });
            // Update the poll message in Discord to remove the buttons and add the results
            await message.edit({
              embeds: [embed],
              components: [],
            });
            try {
              // Delete the poll votes from the database
              await prisma.pollVote.deleteMany({
                where: { pollId: poll.MessageId },
              });
              // Delete the poll from the database
              await prisma.poll.delete({
                where: { MessageId: poll.MessageId },
              });
            } catch (error) {
              console.error("Error when updating vote in db.", error);
              message.reply({
                content:
                  "Une erreur est survenue lors de la mise à jour du vote dans la base de données.",
              });
            }
          } catch (error) {
            console.error("Error when crafting vote results msg:", error);
            channel.send(
              "Une erreur est survenue lors du calcul du message affichant le résultats du vote."
            );
          }
        }
      } catch (error) {
        console.error("Error when fetching channel:", error);
      }
    }
  }
}

function compilePollResults(votes: any[]) {
  // Create an object to count the votes for each option
  const voteCounts: Record<string, number> = {};

  // Count the votes
  votes.forEach((vote) => {
    if (!voteCounts[vote.optionId]) {
      voteCounts[vote.optionId] = 0;
    }
    voteCounts[vote.optionId]++;
  });

  // Transform the counts into a string for display
  let resultsString = "";
  for (const option in voteCounts) {
    const count = voteCounts[option];
    resultsString += `Option "${option}": ${count} vote(s)\n`;
    // Vous pouvez ajouter ici le calcul des pourcentages si vous le souhaitez
  }

  return resultsString;
}
