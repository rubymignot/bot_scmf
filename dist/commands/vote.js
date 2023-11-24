"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: {
        name: "vote",
        description: "Cree un vote",
        dm_permissions: true,
        options: [
            {
                name: "question",
                description: "La question a poser",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "duree",
                description: "La duree du vote en heures",
                type: discord_js_1.ApplicationCommandOptionType.Integer,
                required: true,
            },
            {
                name: "option1",
                description: "Options de vote",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "option2",
                description: "Options de vote",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: "option3",
                description: "Options de vote",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "option4",
                description: "Options de vote",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "option5",
                description: "Options de vote",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "option6",
                description: "Options de vote",
                type: discord_js_1.ApplicationCommandOptionType.String,
                required: false,
            },
        ],
    },
};
