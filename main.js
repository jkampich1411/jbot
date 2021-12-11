/**
    @name: JBot
    @author: TheJakobCraft
    @version: 0.0.1
    In: (currently only) Discord, (Twitch, Telegram)
    Developing Start: 1st April, 2020
*/
//#region IMPORTS
const discord = require('discord.js');
const discordRest = require('@discordjs/rest');
const discordRoutes = require('discord-api-types/v9');
const { DiscordTogether } = require('discord-together');

const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('cfg.json', 'utf8'));

const moment = require("moment");
const dayjs = require("dayjs");
const tz = require('dayjs/plugin/timezone');
dayjs.extend(tz);
require("moment-duration-format");
moment.locale('de');

const https = require("https");
const nodemailer = require('nodemailer');
const mcUserInfo = require('./MCInfo.js');
const qrgen = require('./qrgen.js');

const nodemon = require('nodemon');
//#endregion

//Nodemailer Statuspage
var transporter = nodemailer.createTransport({
    host: "itm-hof.tk",
    port: 587,
    auth: {
        user: cfg.mailLogin,
        pass: cfg.mailPass
    },
    tls: {
        rejectUnauthorized: false
    }
});

var statusUP = {
  from: 'status@thejakobcraft.xyz',
  to: 'component+d9d8e5ba-7189-473f-8093-34014410e8ca@notifications.statuspage.io',
  subject: 'UP',
  text: '_'
};
var statusDOWN = {
    from: 'status@thejakobcraft.xyz',
    to: 'component+d9d8e5ba-7189-473f-8093-34014410e8ca@notifications.statuspage.io',
    subject: 'DOWN',
    text: '_'
};
var statusPARTIAL = {
    from: 'status@thejakobcraft.xyz',
    to: 'component+d9d8e5ba-7189-473f-8093-34014410e8ca+partial_outage@notifications.statuspage.io',
    subject: '__',
    text: '_'
};
var statusDEGRADED = {
    from: 'status@thejakobcraft.xyz',
    to: 'component+d9d8e5ba-7189-473f-8093-34014410e8ca+degraded_performance@notifications.statuspage.io',
    subject: '__',
    text: '_'
};


// DISCORD
    const slashCmds = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

    var client = new discord.Client({
        partials: [
            "MESSAGE",
            "CHANNEL",
            "REACTION"
        ],
        intents: [
            discord.Intents.FLAGS.GUILDS,
            discord.Intents.FLAGS.GUILD_BANS,
            discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
            discord.Intents.FLAGS.GUILD_INTEGRATIONS,
            discord.Intents.FLAGS.GUILD_INVITES,
            discord.Intents.FLAGS.GUILD_MEMBERS,
            discord.Intents.FLAGS.GUILD_MESSAGES,
            discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
            discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
            discord.Intents.FLAGS.GUILD_PRESENCES,
            discord.Intents.FLAGS.GUILD_VOICE_STATES,
            discord.Intents.FLAGS.GUILD_WEBHOOKS,

            discord.Intents.FLAGS.DIRECT_MESSAGES,
            discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
        ]
    });
    client.commands = new discord.Collection();
    client.discordActivites = new DiscordTogether(client);

    var restClient = new discordRest.REST({ version: "9" }).setToken(cfg.token);

    function tellNoAccess(_call, footer, avatar) {
        let emb = new discord.MessageEmbed()
            .setColor('#DD2C00')
            .setFooter(footer, avatar)
            .setTitle('Error: You do not have access to that!')
            .setDescription('You do not have access to this command');
        _call(emb);
    }

    function throwSlashCommandError(_call, footer, avatar, cmdName) {
        let emb = new discord.MessageEmbed()
            .setColor('#DD2C00')
            .setFooter(footer, avatar)
            .setTitle('Error: An error occoured while running!')
            .setDescription(`An error occoured while running ${cmdName}`);
        _call(emb);
    }

    /* !!!!DO NOT USE THIS METHOD UNTIL ALL COMMANDS ARE STABLE AND TESTED!!!! */
    async function registerGlobalSlashCommands(commands) {
        var cmds = [];
        
        commands.forEach(cms => {
            const command = require(`./commands/${cms}`);

            cmds.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        });

        return await restClient.put(discordRoutes.Routes.applicationCommands(client.user.id), {
            body: cmds
        }).then(() => console.log(`Registered ${cmds.length} OFFICIAL Slash-Commands!`))
        .catch(console.error);
    }
    /* !!!!DO NOT USE THIS METHOD UNTIL ALL COMMANDS ARE STABLE AND TESTED!!!! */

    /* !!!!IF NOT ALL OF THE COMMANDS ARE STABLE AND TESTED, USE THIS METHOD!!!! */
    async function registerGuildSlashCommands(commands, guildId) {
        var cmds = [];
        
        commands.forEach(cms => {
            const command = require(`./commands/${cms}`);

            cmds.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        });

        return await restClient.put(discordRoutes.Routes.applicationGuildCommands(client.user.id, guildId), {
            body: cmds
        }).then(() => console.log(`Registered ${cmds.length} TESTING Slash-Commands!`))
        .catch(console.error);
    }
    /* !!!!IF NOT ALL OF THE COMMANDS ARE STABLE AND TESTED, USE THIS METHOD!!!! */

    client.on('ready', () => {
        console.log(`Eingeloggt als ${client.user.username} • Auf ${client.guilds.cache.size} Servern!`);
        registerGuildSlashCommands(slashCmds, '510412740364599317');
        registerGlobalSlashCommands(slashCmds);

        qrgen.runMeFirst();

        client.user.setStatus('dnd');
        client.user.setActivity({
            name: `loading. Please Wait`.toString(),
            activity: {
                type: 'PLAYING'
            }
        });
        
        let activNum = 0;
        setInterval(function() {
            if(activNum === 0) {
                client.user.setActivity({
                    name: `auf ${client.guilds.cache.size} Server`.toString(),
                    activity: {
                        type: 'WATCHING'
                    }
                });
                activNum = 1;
            } else if(activNum === 1) {
                client.user.setActivity({
                    name: `euren Nachrichten`.toString(),
                    activity: {
                        type: 'LISTENING'
                    }
                });
                activNum = 2;
            } else if(activNum === 2) {
                client.user.setActivity({
                    name: `jc!help`.toString(),
                    activity: {
                        type: 'LISTENING'
                    }
                });
                activNum = 3;
            } else if(activNum === 3) {
                client.user.setActivity({
                    name: `auf https://thejakobcraft.xyz`.toString(),
                    activity: {
                        type: 'WATCHING'
                    }
                });
                activNum = 0;
            }
        }, 10 * 1000);

        transporter.sendMail(statusUP, (e, i) => {
            if (!(e)) console.error(e);
            else;
        });

    });

    // Use Slashcommands
    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isCommand()) return;
        const footer = `Angefragt von ${interaction.user.tag} • Auf ${client.guilds.cache.size} Servern`;
        const avatar = interaction.user.avatarURL();
        const command = client.commands.get(interaction.commandName);

        if(command) try { await command.execute(interaction, footer, avatar, client.discordActivites, cfg); } catch(e) {
            console.error(e);

            if(interaction.deferred || interaction.replied) throwSlashCommandError((emb) => interaction.editReply(emb), footer, avatar, interaction.commandName);
            else throwSlashCommandError((emb) => interaction.reply(emb), footer, avatar, interaction.commandName);
        }
    });

    // Globalchat
    client.on('messageCreate', async (msg) => {
        if(msg.author.bot) return;
        
        if(msg.channel.name.startsWith("jc-") && msg.author.id != client.user.id) {

            if(!(msg.author.id = cfg.author) && cfg.globalchat.exclude.some(ss => msg.content.includes(ss))) return msg.delete().then().catch(console.error);

            client.channels.cache.filter(c => c.name.startsWith("jc-")).forEach(c => {                 
                let foot = `${msg.member.guild.name} • Auf ${client.guilds.cache.size} Servern`;
                let avat = msg.author.avatarURL();

                let emb = new discord.MessageEmbed()
                    .setColor("#afd8f8")
                    .setTitle(msg.author.tag)
                    .setDescription(msg.content)
                    .setFooter(foot, avat);
                c.send({ embeds: [emb] });
            });

            msg.delete()
                .then()
                .catch(console.error);
        }
    });

    // Use Normal Commands
    client.on('messageCreate', async (msg) => {
        if(msg.author.bot) return;
        if(!msg.content.startsWith(cfg.prefix)) return;
        const args = msg.content.trim().split(/ +/g);
        const cmd = args[0].slice(cfg.prefix.length).toLowerCase();
        const foot = `Angefragt von ${msg.author.tag} • Auf ${client.guilds.cache.size} Servern`;
        const avat = msg.author.avatarURL();

        if(cmd === "help") {
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);
            if (args[1] === 'help') {
                let emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("CMD: jc!help")
                .setDescription("Dieser Command listet dir alle Befehle auf.\nMit ihm kannst du unter anderem auch diese Nachricht bekommen.")
                .setFooter(foot, avat);
                msg.channel.send({ embeds: [emb] });
            } else 
            if(args[1] === 'chatsetup') {
                let emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("CMD: jc!chatsetup")
                .setDescription("Dieser Command erstellt dir einen Kanal Namens: `#jc-chat`. Dies ist mein Globalchat. ")
                .setFooter(foot, avat);
                msg.channel.send({ embeds: [emb] });
            } else {
                let emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("Du brauchst Hilfe?")
                .setDescription("Hier findest du alle Commands:\n`jc!help\njc!chatsetup`\nMit jc!help <cmd> kannst du dir mehr Infos anzeigen lassen.\nMit /invite invite bekommst du den Invite Link von diesem Bot!\nMit /ping bekommst du die Bot-Latency!")
                .setFooter(foot, avat);
                msg.channel.send({ embeds: [emb] });
            }
        }

        if(cmd === "chatsetup") {
            msg.delete()
            .then()
            .catch(console.error);
            if (msg.author == msg.guild.owner) {
                if(msg.guild.channels.cache.find(channel => channel.name === 'jc-chat')) {
                    let emb = new discord.MessageEmbed()         
                    .setColor('#DD2C00')
                    .setTitle("Den Globalchat erstellen!")
                    .setDescription("Der Globalchat ist schon auf diesem Discord!")
                    .setFooter(foot, avat);
                    msg.channel.send({ embeds: [emb] });
                } else {
                    return;
                }
            }
        }

        if(cmd === "qr") {
            var bgc;
            var fgc;
            if(!args[1]) return;
            if(!args[2]) return;
            if(!args[3]) bgc = null;
            else if(args[3]) bgc =args[3];
            if(!args[4]) fgc = null;
            else if(args[4]) fgc =args[4];

            if(args[1].toLowerCase() === "gen" || args[1].toLowerCase() === "generate") {
                qrgen.runCMD(args[2], bgc, fgc, (uuid) => {
                    let URL = `https://meta.thejakobcraft.xyz:8080/qr/${uuid}.png`;

                    let emb = new discord.MessageEmbed()
                    .setColor('#DD2C00')
                    .setFooter(foot, avat)
                    .setTimestamp()
                    //  Now the Real Shit Begins 
                    .setTitle(`QRcode - generated`)
                    .setDescription(`Here is your generated QR Code!`)
                    .setImage(URL);
                    msg.channel.send({ embeds: [emb] });

                    qrgen.delCMD(uuid);
                });
            }

            if(args[1].toLowerCase() === "mod" || args[1].toLowerCase() === "module") {
                qrgen.moduleInfo((call) => {
                    let emb = new discord.MessageEmbed()
                        .setColor('#DD2C00')
                        .setFooter(foot, avat)
                        .setTitle('QRGen')
                        .setDescription(`**${call}**`);
                    msg.channel.send({ embeds: [emb] });
                });
            }
        }

        if(cmd === "userinfo") {
            if(!args[1]) return;
            if(!args[2]) return;

            if(args[1].toLowerCase() === "mc" || args[1].toLowerCase() === "minecraft") {
                mcUserInfo.fetch(args[2], "https://meta.thejakobcraft.xyz:8080/skin", (res) => {
                    
                    let skinRender = new discord.MessageButton()
                        .setLabel('Skin Render')
                        .setStyle('LINK')
                        .setURL(`https://meta.thejakobcraft.xyz:8080/skin/${args[2]}.html`);

                    let emb = new discord.MessageEmbed()
                        .setColor('#DD2C00')
                        .setFooter(foot, avat)
                        .setTimestamp()
                        //  Now the Real Shit Begins 
                        .setTitle(`Minecraft - Userinfo: ${args[2]}`)
                        .setDescription(`Information about the Minecraft Player ${args[2]}`)
                        .addFields(
                            { name: '⠀', value: '**Player UUIDs:**' },
                            { name: 'Undashed UUID:', value: res[0][0] },
                            { name: 'Dashed UUID:', value: res[0][1] }
                        )
                        .addField('\u200B', '**Past Usernames:**', false);
                        for(let i = 0; i<res[2].length; i++) {
                            emb.addField(res[2][i], '\u200B', true);
                        }

                    msg.channel.send(emb, {buttons: [skinRender]});
                });
            }

            if(args[1].toLowerCase() === "module" || args[1].toLowerCase() === "mod") {
                if(args[2].toLowerCase() === "mc" || args[2].toLowerCase() === "minecraft") {
                    mcUserInfo.moduleInfo((call) => {
                    let emb = new discord.MessageEmbed()
                        .setColor('#DD2C00')
                        .setFooter(foot, avat)
                        .setTitle('MC User Stuff Getter')
                        .setDescription(`**${call}**`);
                    msg.channel.send({ embeds: [emb] });
                });
            }
        }
    }

        if(cmd === "update") {
            if(msg.author.id === cfg.author) {
                var getReleaseInfo = async (_call) => {
                    let opt = {
                        hostname: 'api.github.com',
                        port: 443,
                        path: '/repos/jkampich1411/jbot-releases/releases/latest',
                        headers: {
                            'User-Agent': 'jkdev API Agent/0.1'
                        },
                        method: 'GET'
                    };
                    
                    let req = https.request(opt, res => {
                        let datachunks = [];
                        res.on('data', d => {
                            datachunks.push(d);
                        }).on('end', function() {
                            let dat = Buffer.concat(datachunks);
                            let data = JSON.parse(dat);

                            _call(data.name, data.tag_name, data.body, data.published_at, data.author.login, data.author.avatar_url);
                        });
                    });

                    req.on('error', err => console.error(err));
                    req.end();
                };

                getReleaseInfo((name, tag_name, body, published_at, author, avatar_url) => {
                    client.channels.cache.filter(c => c.name.startsWith("jc-")).forEach(ch => {
                            var emb = new discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(name)
                                .setURL('https://github.com/jkampich1411/jbot-releases/releases/latest')
                                .setAuthor(`A new feature update is ready!`, avatar_url, `https://thejakobcraft.xyz`)
                                .setDescription(body)
                                .setFooter(`Release ${tag_name} • Published at ${dayjs(published_at).format('DD[.]MM[.]YYYY[ | ]HH[:]mm')}`, avat);
                            ch.send({ embeds: [emb] });
                    });
                });

            } else tellNoAccess((emb) => msg.channel.send(emb), foot, avat);
        }
    });

    client.login(cfg.token);

// Twitch

/* W(ork)i(n)P(rogress) */