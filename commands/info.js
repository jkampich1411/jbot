const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

var emb;

module.exports = {
    data: new SlashCommandBuilder().setName('info').setDescription("Zeige dir Informationen über einen User / Server an.")
        .addSubcommand(suC => suC.setName('mc').setDescription("Zeige dir Informationen über einen Minecraft-Player an!"))
        .addSubcommand(suC => suC.setName('server').setDescription("Zeige dir Informationen über den Server an!"))
        .addSubcommand(suC => suC.setName('user').setDescription("Zeige dir Informationen über einen User an!")
        .addUserOption(opt => opt.setName('user').setDescription("User"))),
    async execute(interaction, footer, avatar) {
        switch (interaction.options.getSubcommand()) {
            case 'server':
                let MessageEmbedServer_VerificationLevel;
                let MessageEmbedServer_Owner = await interaction.guild.fetchOwner();

                if(interaction.guild.verificationLevel === 'NONE') MessageEmbedServer_VerificationLevel = 'Ungesichert';
                if(interaction.guild.verificationLevel === 'LOW') MessageEmbedServer_VerificationLevel = 'Schwach';
                if(interaction.guild.verificationLevel === 'MEDIUM') MessageEmbedServer_VerificationLevel = 'Normal';
                if(interaction.guild.verificationLevel === 'HIGH') MessageEmbedServer_VerificationLevel = 'Stark';
                if(interaction.guild.verificationLevel === 'VERY_HIGH') MessageEmbedServer_VerificationLevel = 'Sehr Stark';

                emb = new MessageEmbed()
                    .setTitle(`Informationen über den Server ${interaction.guild.name}`)
                    .setFooter(footer, avatar)
                    .addFields([
                        {
                            name: "Erstellt am",
                            value: `<t:${Math.round(interaction.guild.createdTimestamp/1000)}>`,
                            inline: true
                        },
                        {
                            name: 'Channels (mit Kategorien)',
                            value: `${interaction.guild.channels.cache.size} Channels`,
                            inline: true
                        },
                        {
                            name: 'Verifikationslevel',
                            value: `${MessageEmbedServer_VerificationLevel}`,
                            inline: true
                        }
                    ])
                    .addFields([
                        {
                            name: "Guild ID",
                            value: `${interaction.guild.id}`,
                            inline: true
                        }
                    ])
                    .addFields([
                        {
                            name: "Server Owner:",
                            value: `<@${MessageEmbedServer_Owner.user.id}>`,
                            inline: true
                        },
                        {
                            name: 'Owner ID',
                            value: `${MessageEmbedServer_Owner.user.id}`,
                            inline: true
                        },
                        {
                            name: "Owner-User erstellt am",
                            value: `<t:${Math.round(MessageEmbedServer_Owner.user.createdTimestamp/1000)}>`,
                            inline: true
                        }
                    ]);

                interaction.reply({
                    embeds: [emb],
                    ephemeral: true
                });

                break;
        
            case 'user':
                let user;
                if(interaction.options.getMember('user')) user = interaction.options.getMember('user');
                else user = interaction.member;

                let MessageEmbedUser_Nickname;
                if(user.nickname) MessageEmbedUser_Nickname = user.nickname;
                else MessageEmbedUser_Nickname = "Kein Nickname";

                emb = new MessageEmbed()
                    .setTitle(`Informationen über den User @${user.user.username}#${user.user.discriminator}`)
                    .setThumbnail(user.user.avatarURL({dynamic: true}))
                    .setFooter(footer, avatar)
                    .addFields([
                        {
                            name: "User erstellt am",
                            value: `<t:${Math.round(user.user.createdTimestamp/1000)}>`,
                            inline: true
                        },
                        {
                            name: "User Beigetreten am",
                            value: `<t:${Math.round(user.joinedTimestamp/1000)}>`,
                            inline: true
                        },
                        {
                            name: "User Nickname",
                            value: `${MessageEmbedUser_Nickname}`,
                            inline: true
                        }
                    ]);
                
                interaction.reply({
                    embeds: [emb],
                    ephemeral: true
                });

                break;

            case 'mc':
                
                emb = new MessageEmbed()
                    .setColor("BLURPLE")
                    .setFooter(footer, avatar)
                    .setTitle("gar kein bock")
                    .setDescription("ich hab kein bock diesen command zu porten. mach ich irgenwann mal");
                
                interaction.reply({
                    embeds: [emb],
                    ephemeral: true
                });

                break;
        }
    }
};