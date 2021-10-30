/*
    Name: JBot
    Author: TheJakobCraft
    Version: 1.0.0
    Programs: Twitch, Discord and Telegram
    Developing Start: 1st April, 2020
*/
// IMPORTS
const discord = require('discord.js');
const discordRest = require('@discordjs/rest');
const discordRoutes = require('discord-api-types/v9');
const fs = require('fs');
const mysql = require("mysql");
const ytdl = require("ytdl-core");
const moment = require("moment");
const dayjs = require("dayjs");
const tz = require('dayjs/plugin/timezone');
dayjs.extend(tz);
const qrg = require("qrcode");
const https = require("https");
const TelegramBot = require('node-telegram-bot-api');
const { isAbsolute } = require('path');
const nodemon = require('nodemon');
const { chdir, stdout } = require('process');
const nodemailer = require('nodemailer');
const request = require('request');
const mcUserInfo = require('./MCInfo.js');
const qrgen = require('./qrgen.js');
const utils = require('./classes/utils.js');
const { clearImmediate } = require('timers');
const { executionAsyncResource } = require('async_hooks');
const flags = {
	DISCORD_EMPLOYEE: 'Discord Employee',
	DISCORD_PARTNER: 'Discord Partner',
	BUGHUNTER_LEVEL_1: 'Bug Hunter (Level 1)',
	BUGHUNTER_LEVEL_2: 'Bug Hunter (Level 2)',
	HYPESQUAD_EVENTS: 'HypeSquad Events',
	HOUSE_BRAVERY: 'House of Bravery',
	HOUSE_BRILLIANCE: 'House of Brilliance',
	HOUSE_BALANCE: 'House of Balance',
	EARLY_SUPPORTER: 'Early Supporter',
	TEAM_USER: 'Team User',
	SYSTEM: 'System',
	VERIFIED_BOT: 'Verified Bot',
	VERIFIED_DEVELOPER: 'Verified Bot Developer'
};
require("moment-duration-format");
moment.locale('de');


//Nodemailer Statuspage
var transporter = nodemailer.createTransport({
    host: "itm-hof.tk",
    port: 587,
    auth: {
        user: "status@thejakobcraft.xyz",
        pass: "Jakob@1411"
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
const cfg = JSON.parse(fs.readFileSync('cfg.json', 'utf8'));
const slashCmds = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

var client = new discord.Client({
        partials: ["MESSAGE", "CHANNEL", "REACTION"],
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

var restClient = new discordRest.REST({
        version: "9"
    }).setToken(cfg.token);

    function tellNoAccess(_call, footer, avatar) {
        let emb = new discord.MessageEmbed()
            .setColor('#DD2C00')
            .setFooter(footer, avatar)
            .setTitle('Error: You do not have access to that!')
            .setDescription('You do not have access to this command');
        _call(emb);
    }

    function throwSlashCommandError(_call, footer, cmdName) {
        let emb = new discord.MessageEmbed()
            .setColor('#DD2C00')
            .setFooter(footer)
            .setTitle('Error: An error occoured while running!')
            .setDescription(`An error occoured while running ${cmdName}`);
        _call(emb);
    }

    async function registerGuildSlashCommands(commands, guildId) {
        var cmds = [];
        
        commands.forEach(cms => {
            const command = require(`./commands/${cms}`);

            cmds.push(command.data.toJSON());
            client.commands.set(command.data.name, command);
        });

        return await restClient.put(discordRoutes.Routes.applicationGuildCommands(client.user.id, guildId), {
            body: cmds
        })
            .then(() => console.log(`Registered ${cmds.length} Slash-Commands!`))
            .catch(console.error);
    }

    client.on('ready', () => {
        client.user.setStatus('dnd');
        qrgen.runMeFirst();
        registerGuildSlashCommands(slashCmds, '510412740364599317');

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
        console.log(`Eingeloggt als ${client.user.username} | Auf ${client.guilds.cache.size} Servern!`);
        transporter.sendMail(statusUP, function(error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log();
            }
          });

    });
    client.on('reconnecting', () => {
        console.log("Verbindet neu!");
    });
    client.on('disconnect', () => {
        console.log("Verbindung trennen");
    });


    // Use Slashcommands
    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isCommand()) return;
        const footer = `Angefragt von ${interaction.user.tag} • Auf ${client.guilds.cache.size} Servern`;
        const avatar = interaction.user.avatarURL();
        const command = client.commands.get(interaction.commandName);

        if(command) try {
            await command.execute(interaction, footer, avatar);
        } catch(e) {
            console.error(e);

            if(interaction.deferred || interaction.replied) throwSlashCommandError((emb) => interaction.editReply(emb), footer, interaction.commandName);
            else throwSlashCommandError((emb) => interaction.reply(emb), footer, interaction.commandName);
        }
    });

    // Globalchat
    client.on('messageCreate', (msg) => {
        const foot = `${msg.member.guild.name} • Auf ${client.guilds.cache.size} Servern`;
        const avat = msg.author.avatarURL();
        
        if(msg.channel.name.startsWith("jc-") && msg.author.id != client.user.id) {
            msg.delete()
                .then(msg => console.log())
                .catch(console.error);             
            client.channels.cache.filter(c => c.name.startsWith("jc-")).forEach(channel => {                 
                var embed = new discord.MessageEmbed()
                    .setColor("#afd8f8")
                    .setTitle(msg.author.tag)
                    .setDescription(msg.content)
                    .setFooter(foot, avat)
                channel.send(embed)    
            });             
            return;
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
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("CMD: jc!help")
                .setDescription("Dieser Command listet dir alle Befehle auf.\nMit ihm kannst du unter anderem auch diese Nachricht bekommen.")
                .setFooter(foot, avat)
                msg.channel.send(emb);
            } else 
            if(args[1] === 'chatsetup') {
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("CMD: jc!chatsetup")
                .setDescription("Dieser Command erstellt dir einen Kanal Namens: `#jc-chat`. Dies ist mein Globalchat. ")
                .setFooter(foot, avat)
                msg.channel.send(emb);
            } else
            if(args[1] === 'invite') {
                var emb = new discord.MessageEmbed()
                .setColor('#0099ff')
                .setTitle("Der Invite Link")
                .setDescription("Du möchtest den Bot auch auf deinem Server haben? Dann klick (hier!)[https://discord.com/api/oauth2/authorize?client_id=903970959457927219&permissions=8&redirect_uri=https%3A%2F%2Fthejakobcraft.xyz&scope=bot%20applications.commands] Viel Spaß")
                .setFooter(foot, avat)
                msg.channel.send(emb);
            } else
            if(args[1] === 'ping') {
                const startTime = Date.now();
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("Ping")
                .setDescription("Pong!")
                .setFooter(foot, avat)
                msg.channel.send(emb).then(msg => {
                    const endTime = Date.now();
                    var emb = new discord.MessageEmbed()
                    .setColor("#DD2C00")
                    .setTitle("Ping")
                    .setDescription(`Pong! (${endTime - startTime}ms)`)
                    .setFooter(foot, avat)
                    msg.edit(emb);
                });
            } else {
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("Du brauchst Hilfe?")
                .setDescription("Hier findest du alle Commands:\n`jc!help\njc!chatsetup`\nMit jc!help <cmd> kannst du dir mehr Infos anzeigen lassen.\nMit jc!help invite bekommst du den Invite Link von diesem Bot!\nMit jc!help ping bekommst du die Bot-Latency!")
                .setFooter(foot, avat)
                msg.channel.send(emb);
            }
        }

        if(cmd === "chatsetup") {
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);
            if (msg.author = msg.guild.owner) {
                if(msg.guild.channels.cache.find(channel => channel.name === 'jc-chat')) {
                    var emb = new discord.MessageEmbed()         
                    .setColor('#DD2C00')
                    .setTitle("Den Globalchat erstellen!")
                    .setDescription("Du hast den Globalchat doch schon! Halte ausschau nach einem Kanal der 'jc-chat' heißt!")
                    .setFooter(foot, avat)
                    msg.channel.send(emb)
                } else {
                    msg.guild.channels.create("jc-chat", {type: 'text'})
                    .then(console.log)
                    .catch(console.error);
                    var emb = new discord.MessageEmbed();
                    emb.setColor("#0099ff")
                    emb.setTitle("Den Globalchat erstellen!")
                    emb.setDescription(`Anscheinend willst du meinen Globalchat verwenden! Deshalb habe ich einen Textkanal erstellt der 'jc-chat' heißt. Dies ist mein Globalchat! Viel Spaß`,)
                    emb.setFooter(foot, avat)
                    msg.channel.send("", emb).then((m) => {
                        message = m;
                    }); 
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

                    var emb = new discord.MessageEmbed()
                    .setColor('#DD2C00')
                    .setFooter(foot, avat)
                    .setTimestamp()
                    //  Now the Real Shit Begins 
                    .setTitle(`QRcode - generated`)
                    .setDescription(`Here is your generated QR Code!`)
                    .setImage(URL);
                    msg.channel.send(emb);

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
                    msg.channel.send(emb)});
            }
        }

        if(cmd === "userinfo") {
            if(!args[1]) return;
            if(!args[2]) return;

            if(args[1].toLowerCase() === "mc" || args[1].toLowerCase() === "minecraft") {
                mcUserInfo.fetch(args[2], "https://meta.thejakobcraft.xyz:8080/skin", (res) => {
                    
                    let skinRender = new discord.MessageButton()
                        .setCustomId(`jctv_skinr_${args[2]}`)
                        .setLabel('Skin Render')
                        .setStyle('LINK')
                        .setURL(`https://meta.thejakobcraft.xyz:8080/skin/${args[2]}.html`)

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

            if(args[1].toLowerCase() === "module") {
                if(args[2].toLowerCase() === "mc") {
                    mcUserInfo.moduleInfo((call) => {
                    let emb = new discord.MessageEmbed()
                        .setColor('#DD2C00')
                        .setFooter(foot, avat)
                        .setTitle('MC User Stuff Getter')
                        .setDescription(`**${call}**`);
                    msg.channel.send(emb)});
                }
                if(args[2].toLowerCase() === "secretmc") {
                    mcUserInfo.secretModuleInfo((call) => {
                        let emb = new discord.MessageEmbed()
                            .setColor('#DD2C00')
                            .setFooter(foot, avat)
                            .setTitle('MC User Stuff Getter')
                            .setDescription(`**${call}**`);
                        msg.channel.send(emb)});
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
                    }
                    
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
                }

                getReleaseInfo((name, tag_name, body, published_at, author, avatar_url) => {
                    client.channels.cache.filter(c => c.name.startsWith("jc-")).forEach(ch => {
                            var emb = new discord.MessageEmbed()
                                .setColor('#0099ff')
                                .setTitle(name)
                                .setURL('https://github.com/jkampich1411/jbot-releases/releases/latest')
                                .setAuthor(`A new feature update is ready!`, avatar_url, `https://thejakobcraft.xyz`)
                                .setDescription(body)
                                .setFooter(`Release ${tag_name} • Published at ${dayjs(published_at).format('DD[.]MM[.]YYYY[ | ]HH[:]mm')}`, avat);
                            ch.send(emb)
                    });
                });

            } else {
                tellNoAccess((emb) => {
                    msg.channel.send(emb);
                }, foot, avat);
            }
        }

        if(cmd === "makeitspooky") {
            var delRole = msg.guild.roles.cache.find(role => role.name === 'thejakobutils_temp');
            if(delRole) delRole.delete('brauch ich net mehr smh');

            function CreateRole() {
                msg.guild.roles.create({
                    data: {
                        name: 'thejakobutils_temp',
                        color: 'BLUE',
                    },
                    reason: 'Temp Rolle für Spooky! Ich lösche die Rolle wieder! Versprochen!'
                });
            }

            function RolesCreated() {
                var role = msg.guild.roles.cache.some(role => role.name === 'thejakobutils_temp');
                var guildMember = msg.mentions.members.first();
    
                if(role) guildMember.roles.add(role);
                else msg.channel.send('role does not exist');
    
                msg.reply(`you can now use \`\`\`jc!spookifier\`\`\``);
            }

            setTimeout(CreateRole, 1000);
            setTimeout(RolesCreated, 1500);

        }

        if(cmd === "spookifier") {
            var emojis = [
                '🎃',
                '🦇',
                '👻',
                '🕸',
                '🧛‍♀️',
                '🧛‍♂️',
                '🧛'
            ];
    
            var channelNames = [
                'jc-spookchat-replacecontent-',
                'jc-spookierchat-replacecontent-',
                'jc-iamspookychat-replacecontent-',
                'jc-scarychat-replacecontent-',
                'jc-scarierchat-replacecontent-',
                'jc-totallynotscarychat-replacecontent-',
                'jc-itsspookyseason-replacecontent-'
            ];
    
            var tempChannelName = channelNames[Math.floor(Math.random()*channelNames.length)];
            var tempEmoji = emojis[Math.floor(Math.random()*emojis.length)];
    
            if(msg.member.roles.cache.find(role => role.name === 'thejakobutils_temp')) {
                client.channels.cache.filter(c => c.name.startsWith("jc-")).forEach(ch => {
                    var ChannelName = tempChannelName.replace('-replacecontent-', tempEmoji);
    
                    var emb = new discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('Spookifing everything!')
                        .setDescription('Oh, Spooky!')
                        .setFooter(foot, avat);
                    msg.channel.send(emb);
    
                    ch.setName(ChannelName)

                    var delRole = msg.guild.roles.cache.find(role => role.name === 'thejakobutils_temp');
                    if(delRole) delRole.delete('brauch ich net mehr smh');
                });


            }
        }
    });

client.login(cfg.token);

// Twitch

/* W(ork)i(n)P(rogress) */
/*
// Telegram
var bot = new TelegramBot(cfg.telegramtoken, {polling: true});
bot.on('message', (msg) => {
    let chatID = msg.chat.id;
    if(msg.text === /\/abt/) return;
    if(msg.text === /\/sdm/) return;
    bot.sendMessage(chatID, 'Nachricht erhalten')
});
bot.onText(/\/abt/, function (msg) {
    bot.sendMessage(msg.chat.id, `Der Owner dieses Bots ist @TheJakobCraft! Mehr Infos findest du auf Discord!`);
});
// ALL
bot.onText(/\/sdm/, function (msg) {
    let chanid = "733638201935265812";
    let message = msg.text.slice(4);
    if(!message) {
        message = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.";
    }
    client.channels.cache.get(chanid).send(`**[TELEGRAM] ${msg.from.first_name} (@${msg.from.username}):** ${message}`);
    bot.sendMessage(msg.chat.id, `Nachricht an Discord gesendet!`);
});
*/
