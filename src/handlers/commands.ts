import { Interaction, GuildMember } from "discord.js";
import creervote from "../commands/creervote";

export async function handleCommands(interaction: Interaction) {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // Assuming your interaction happens in a guild
  if (!interaction.inGuild()) {
    await interaction.reply("This command can only be used in a server.");
    return;
  }

  // Get the member who initiated the interaction
  const member = interaction.member as GuildMember;

  // Define the role IDs you want to check
  const requiredRoleIds = ["ROLE_ID_1", "ROLE_ID_2"];

  // Check if the member has any of the required roles
  const hasRequiredRole = requiredRoleIds.some((roleId) =>
    member.roles.cache.has(roleId)
  );

  switch (commandName) {
    case "creervote":
      if (!hasRequiredRole) {
        await interaction.reply(
          "Vous n'avez pas la permission d'utiliser cette commande. Demandez à l'équipe des Guides."
        );
        return;
      }
      await creervote(interaction);
      break;

    // Add more cases for other commands as needed
  }
}
