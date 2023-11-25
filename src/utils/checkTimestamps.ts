import { Client, TextChannel } from "discord.js";
import prisma from "../prismaClient";

export async function checkTimestampsAndSendMessage(discordClient: Client) {
  console.log("Checking timestamps...");
  const oneDayAgo = new Date();
  oneDayAgo.setHours(oneDayAgo.getHours() - 24);

  const polls = await prisma.poll.findMany({
    include: { PollVote: true },
  });

  const currentTime = new Date();

  for (const poll of polls) {
    const expirationTime = new Date(poll.createdAt);
    expirationTime.setHours(expirationTime.getHours() + poll.duree);

    if (currentTime >= expirationTime) {
      const channel = discordClient.channels.cache.get(
        poll.ChannelId
      ) as TextChannel;
      if (channel) {
        try {
          const message = await channel.messages.fetch(poll.MessageId);
          const results = compilePollResults(poll.PollVote);
          message.reply(
            `Le vote pour la question "${poll.question}" est terminé. \nRésultats : \n${results}`
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
    resultsString += `Option ${option}: ${count} vote(s)\n`;
    // Vous pouvez ajouter ici le calcul des pourcentages si vous le souhaitez
  }

  return resultsString;
}
