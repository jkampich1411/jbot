const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('activity').setDescription('Start a Discord Activity')
            .addStringOption(opt => opt.setName('activity')
                .setDescription('Which Activity do you want to start?')
                .setRequired(true)
                .addChoice('Youtube Together', 'youtube')
                .addChoice('Poker Night', 'poker')
                .addChoice('Chess in the Park', 'chess')
                .addChoice('Checkers in the Park', 'checkers')
                .addChoice('Betrayal', 'betrayal')
                .addChoice('Fishington', 'fishing')
                .addChoice('Letter Tile', 'lettertile')
                .addChoice('Words Snack', 'wordsnack')
                .addChoice('Doodle Crew', 'doodlecrew')
                .addChoice('SpellCast', 'spellcast')
                .addChoice('Awkword', 'awkword')
                .addChoice('Puttparty', 'puttparty')),
    async execute(interaction, footer, avatar, discordActivites, cfg) {

        let dictionary = {
            "youtube": "Youtube Together",
            "poker": "Poker Night",
            "chess": "Chess in the Park",
            "checkers": "Checkers in the Park",
            "betrayal": "Betrayal",
            "fishing": "Fishington",
            "lettertile": "Letter Tile",
            "wordsnack": "Words Snack",
            "doodlecrew": "Doodle Crew",
            "spellcast": "SpellCast",
            "awkword": "Awkword",
            "puttparty": "Puttparty"
        };
        let interactionMember = interaction.member;
        let interactionOptions = interaction.options._hoistedOptions[0];
        let requestedPermissions = [
            Permissions.PRIORITY_SPEAKER,
            Permissions.STREAM
        ];

        if(interactionMember.voice.channel) {
            if(interactionOptions.name === "activity" && interactionOptions.type === "STRING" && interactionMember.permissions.has(requestedPermissions) || interactionMember.user.id === cfg.author) discordActivites.createTogetherCode(interactionMember.voice.channel.id, interaction.options._hoistedOptions[0].value).then(async code => {

                let bttnLabel = ``;
                switch (interactionOptions.value) {
                    case 'youtube':
                        bttnLabel = dictionary.youtube;
                        break;
                    
                    case 'poker':
                        bttnLabel = dictionary.poker;
                        break;
                    
                    case 'chess':
                        bttnLabel = dictionary.chess;
                        break;

                    case 'checkers':
                        bttnLabel = dictionary.checkers;
                        break;
                    
                    case 'betrayal':
                        bttnLabel = dictionary.betrayal;
                        break;
                    
                    case 'fishing':
                        bttnLabel = dictionary.fishing;
                        break;
                    
                    case 'lettertile':
                        bttnLabel = dictionary.lettertile;
                        break;

                    case 'wordsnack':
                        bttnLabel = dictionary.wordsnack;
                        break;

                    case 'doodlecrew':
                        bttnLabel = dictionary.doodlecrew;
                        break;
                    
                    case 'spellcast':
                        bttnLabel = dictionary.spellcast;
                        break;
                    
                    case 'awkword':
                        bttnLabel = dictionary.awkword;
                        break;

                    case 'puttparty':
                        bttnLabel = dictionary.puttparty;
                        break;

                    default:
                        return;
                }

                return interaction.reply({
                    content: '\u200B',
                    components: [
                        new MessageActionRow().addComponents(new MessageButton()
                            .setStyle('LINK')
                            .setLabel(`${bttnLabel}`)
                            .setURL(code.code)
                        )
                    ],
                    ephemeral: true
                });
            });

        } else return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor("BLURPLE")
                    .setFooter(footer, avatar)
                    .setTitle("You are not in a Voice Channel")
                    .setDescription("Please join a Voice Channel to proceed!")
            ],
            ephemeral: true
        });
    }
};