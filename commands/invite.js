const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('invite').setDescription('Sends invite link'),
    async execute(interaction, footer, avatar) {
        let rawButton = new MessageButton()
            .setLabel("Invite Link")
            .setStyle('LINK')
            .setURL('https://discord.com/api/oauth2/authorize?client_id=903970959457927219&permissions=8&redirect_uri=https%3A%2F%2Fthejakobcraft.xyz&scope=bot%20applications.commands');
        let button = new MessageActionRow().addComponents(rawButton);

        interaction.reply({
            content: '\u200B',
            components: [button],
            ephemeral: true
        });
    }
};