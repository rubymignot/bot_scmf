import { Client, TextChannel } from "discord.js";
import prisma from "../prismaClient";

export async function checkTimestampsAndSendMessage(discordClient: Client) {
  console.log("Checking timestamps...");

  const polls = await prisma.poll.findMany({
    include: { PollVote: true },
  });

  const currentTime = new Date();

  for (const poll of polls) {
    const expirationTime = new Date(
      poll.createdAt.getTime() + poll.duree * 3600000
    );

    if (currentTime >= expirationTime && !poll.finished) {
      try {
        const channelId = poll.ChannelId.replace(/<#|>/g, "");
        const channel = (await discordClient.channels.fetch(
          channelId
        )) as TextChannel;
        if (channel) {
          try {
            console.log("Sending results for poll to channel ", channel.name);
            const message = await channel.messages.fetch(poll.MessageId);
            const results = compilePollResults(poll.PollVote);
            // Update the poll message in Discord to remove the buttons and add the results
            await message.edit({
              embeds: message.embeds,
              components: [],
            });
            message.reply(
              `Le vote pour la question "**${poll.question}**" est terminé. \n\nRésultats : \n${results}`
            );
            try {
              await prisma.poll.update({
                where: { MessageId: poll.MessageId },
                data: { finished: true },
              });
            } catch (error) {
              console.error("Error when updating vote in db.", error);
            }
          } catch (error) {
            console.error("Error when crafting vote results msg:", error);
          }
        }
      } catch (error) {
        console.error("Error when fetching channel:", error);
      }
    }
  }
  console.log("Checked timestamps.");
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
    resultsString += `Option "*${option}*": ${count} vote(s)\n`;
    // Vous pouvez ajouter ici le calcul des pourcentages si vous le souhaitez
  }

  return resultsString;
}
