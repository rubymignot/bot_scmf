"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vote = void 0;
const discord_js_1 = require("discord.js");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function vote(interaction) {
    const question = interaction.options.get("question");
    const options = [
        { name: "option1", value: interaction.options.get("option1") },
        { name: "option2", value: interaction.options.get("option2") },
        { name: "option3", value: interaction.options.get("option3") },
        { name: "option4", value: interaction.options.get("option4") },
        { name: "option5", value: interaction.options.get("option5") },
        { name: "option6", value: interaction.options.get("option6") },
    ];
    const optionsText = (options) => {
        for (let option of options) {
            let i = 0;
            if (option === null) {
                return;
            }
            else {
                i++;
                return "\n" + "Options numéro" + i + ": " + option;
            }
        }
    };
    const duree = interaction.options.get("duree");
    let optionIds = [];
    // Create Option records first
    for (const option of options) {
        if (!option?.value)
            continue;
        const createdOption = await prisma.option.create({
            data: {
                nom: option.value?.value?.toString() || "Pas de texte",
            },
        });
        optionIds.push(createdOption.id);
    }
    for (const optionId of optionIds) {
        await prisma.vote.create({
            data: {
                question: question?.value?.toString() || "Pas de question",
                optionId: optionId,
                duree: Number(duree?.value) || 0,
            },
        });
    }
    let description = `Le vote durera ${duree?.value} heures.`;
    const embed = new discord_js_1.EmbedBuilder()
        .setColor("#00FF00")
        .setTitle(question?.value?.toString() || "Pas de question")
        .setDescription(description)
        .setFooter({
        text: `Vote créé par ${interaction.user.username}`,
        iconURL: interaction.user.avatarURL() || undefined,
    })
        .setTimestamp();
    const buttons = options
        .filter((option) => option?.value?.toString())
        .map((option) => {
        return new discord_js_1.ButtonBuilder()
            .setCustomId(option.name)
            .setLabel(option.value?.value?.toString() || "Pas de texte")
            .setStyle(discord_js_1.ButtonStyle.Primary);
    });
    const row = new discord_js_1.ActionRowBuilder().addComponents(buttons);
    const reply = await interaction.reply({
        embeds: [embed],
        components: [row],
    });
    const voteInteractions = await reply.awaitMessageComponent({
        // convertir les heures en millisecondes
        time: duree !== null ? Number(duree) * 3600000 : undefined,
    });
    if (!voteInteractions)
        return;
    const votes = options.find((option) => option.name === voteInteractions.customId);
    if (!votes)
        return;
    await voteInteractions.reply({
        content: `Vous avez voté pour ${votes.value.value}`,
        ephemeral: true,
    });
    description += `\n<@${interaction.member?.user.id}> a voté pour ${votes.value.value}`;
    embed.setDescription(description);
    await interaction.editReply({
        embeds: [embed],
        components: [row],
    });
}
exports.vote = vote;
