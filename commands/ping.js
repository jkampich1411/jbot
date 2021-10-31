const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Bot Latency Test'),
    async execute(interaction, footer, avatar) {
        var startTime = Date.now();
        let emb = new MessageEmbed()
            .setColor('AQUA')
            .setTitle(' ')
            .setDescription(' ')
            .setFooter(footer, avatar)
        
        interaction.reply({
            embeds: [emb],
            ephemeral: true
        })
        
        .then(() => {
            var endTime = Date.now();
            let emb = new MessageEmbed()
                .setColor('AQUA')
                .setTitle('Pong!')
                .setDescription(`:hourglass: Latency: ${endTime - startTime}ms`)
                .setFooter(footer, avatar)
            
            interaction.editReply({
                embeds: [emb],
                ephemeral: true
            });
        });
    }
}