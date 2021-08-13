/* 
    Name: JBot
    Author: TheJakobCraft
    Version: 1.0.0
    Programs: Twitch, Discord and Telegram
    Developing Start: 1st April, 2020
*/
// IMPORTS
const discord = require('discord.js');
const fs = require('fs');
const mysql = require("mysql");
const ytdl = require("ytdl-core");
const moment = require("moment");
const TelegramBot = require('node-telegram-bot-api');
const { isAbsolute } = require('path');
const nodemon = require('nodemon');
const { chdir, stdout } = require('process');
const nodemailer = require('nodemailer');
const request = require('request');
const mcUserInfo = require('./MCInfo.js');
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
var client = new discord.Client({partials: ["MESSAGE", "CHANNEL", "REACTION"]});
var servers = {};
const cfg = JSON.parse(fs.readFileSync('cfg.json', 'utf8'));
function abfrageName(DCID, msg) {
    var sql = 'SELECT * FROM users WHERE discord_id = ' + mysql.escape(DCID);
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            if (!result.length) {
                console.log("abfrageName(): False"); 
                msg.reply("Du bist nicht registriert! Bitte kontaktiere TheJakobCraft!")      
            } else {
                console.log("abfrageName(): True");
                msg.reply("Ok");  
                msg.member.addRole('630052023487823882');
            }
        });
        return;
    };
    function msgOutput(msg) {
        console.log(msg + " " +msg.author.username);
    }
    function getTimeRemaining(et){
        var total = Date.parse(et) - Date.parse(new Date());
        var seconds = Math.floor( (total/1000) % 60 );
        var minutes = Math.floor( (total/1000/60) % 60 );
        var hours = Math.floor( (total/(1000*60*60)) % 24 );
        var days = Math.floor( total/(1000*60*60*24) );
      
        return {
          total,
          days,
          hours,
          minutes,
          seconds
        };
      }
    client.on('ready', () => {
        client.user.setPresence({
            status: 'online',
            activity: {
                name: `loading. Please Wait`,
                type: 'PLAYING',
            }
        });
        let activNum = 0;
        setInterval(function() {
            if(activNum === 0) {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `auf ${client.guilds.cache.size} Server`,
                        type: 'WATCHING'
                    }
                });
                activNum = 1;
            } else if(activNum === 1) {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `euren Nachrichten`,
                        type: 'LISTENING'
                    }
                });
                activNum = 2;
            } else if(activNum === 2) {
                client.user.setPresence({
                    status: 'online',
                    activity: {
                        name: `jc!help`,
                        type: 'LISTENING'
                    }
                });
                activNum = 0;
            }
        }, 10 * 1000);
        console.log(`Eingeloggt als ${client.user.username}`);
        console.log(`Auf ${client.guilds.cache.size} Servern!`)
        // con.connect(function(err) {
        //     if (err) throw err;
        //     con.query(`SELECT * FROM users`, function (err, result, fields) {
        //       if (err) throw err;
        //       console.log(result);
        //     });
        //   });
        transporter.sendMail(statusUP, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log();
            }
          });
        
        //register SlashCMDS
        client.api.applications(client.user.id).guilds('510412740364599317').commands.post({
            data: {
                name: "help",
                description: "The Help Command",
                options: [
                    {
                        "name": "type",
                        "description": "Choose Helppage",
                        "type": 3,
                        "required": false
                    }
                ]
            }
        });
        client.api.applications(client.user.id).guilds('510412740364599317').commands.post({
           data: {
               name: "invite",
               description: "Send Bot Invite Link"
           } 
        });

    });
    client.on('reconnecting', () => {
        console.log("Verbindet neu!");
    });
    client.on('disconnect', () => {
        console.log("Verbindung trennen");
    });


    //Define Slashcommands
    client.ws.on('INTERACTION_CREATE', async interaction => {
        const cmd = interaction.data.name.toLowerCase();
        const args = interaction.data.options;
        const foot = `Auf ${client.guilds.cache.size} Servern`;


        //HelpCommand
        if(cmd === "help") {
            if(!args) {
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("Du brauchst Hilfe?")
                .setDescription("Hier findest du alle Commands:\n`jc!help\njc!invite\njc!chatsetup`\nMit jc!help <cmd> kannst du dir mehr Infos anzeigen lassen.")
                .setFooter(foot)
                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: {
                            content: '_'
                        }
                    }
                })
                new discord.WebhookClient(client.user.id, interaction.token).send(emb);
            } else { 
                if (args[0]["value"] === 'help') {
                    var emb = new discord.MessageEmbed()
                    .setColor("#DD2C00")
                    .setTitle("CMD: jc!help")
                    .setDescription("Dieser Command listet dir alle Befehle auf.\nMit ihm kannst du unter anderem auch diese Nachricht bekommen.")
                    .setFooter(foot)
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: '_'
                            }
                        }
                    })
                    new discord.WebhookClient(client.user.id, interaction.token).send(emb);
                } else 
                if(args[0]["value"] === 'invite') {
                    var emb = new discord.MessageEmbed()
                    .setColor("#DD2C00")
                    .setTitle("CMD: jc!invite")
                    .setDescription("Dieser Command sendet dir den Invite-Link dieses Bots.")
                    .setFooter(foot)
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: '_'
                            }
                        }
                    })
                    new discord.WebhookClient(client.user.id, interaction.token).send(emb);
                } else
                if(args[0]["value"] === 'chatsetup') {
                    var emb = new discord.MessageEmbed()
                    .setColor("#DD2C00")
                    .setTitle("CMD: jc!chatsetup")
                    .setDescription("Dieser Command erstellt dir einen Kanal Namens: `#jc-chat`. Dies ist mein Globalchat. ")
                    .setFooter(foot)
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: '_'
                            }
                        }
                    })
                    new discord.WebhookClient(client.user.id, interaction.token).send(emb);
                } else
                if(args[0]["value"] === 'ping') {
                    var emb = new discord.MessageEmbed()
                    .setColor("#DD2C00")
                    .setTitle("CMD: jc!ping")
                    .setDescription("Dieser Command sendet die Bot-Latency!")
                    .setFooter(foot)
                    client.api.interactions(interaction.id, interaction.token).callback.post({
                        data: {
                            type: 4,
                            data: {
                                content: '_'
                            }
                        }
                    })
                    new discord.WebhookClient(client.user.id, interaction.token).send(emb);
                }
            }
        }  
    });

    //Globalchat
    client.on('message', (msg)=> {
        const foot = `Angefragt von ${msg.author.tag} | Auf ${client.guilds.cache.size} Servern`;
        const avat = msg.author.avatarURL();
            if(msg.channel.name.startsWith("jc-") && msg.author.id != client.user.id) {
                msg.delete()
                .then(msg => console.log(``))
                .catch(console.error);             
                client.channels.cache.filter(c => c.name.startsWith("jc-")).forEach(channel => {                 
                    var embed = new discord.MessageEmbed()
                    .setColor("#afd8f8")
                    .setTitle(msg.author.tag)
                    .setDescription(msg.content)
                    .setFooter(msg.member.guild.name + " | " + `Auf ${client.guilds.cache.size} Servern`, avat)
                    channel.send(embed)    
                });             
            return;
        }
    });


    //Commands
    client.on('message', (msg) => { 
        if(msg.author.bot) return;
        if(!msg.content.startsWith(cfg.prefix)) return;
        const args = msg.content.trim().split(/ +/g);
        const cmd = args[0].slice(cfg.prefix.length).toLowerCase();
        const foot = `Angefragt von ${msg.author.tag} | Auf ${client.guilds.cache.size} Servern`;
        const avat = msg.author.avatarURL();



        //Maybe not needing this anymore
        /* if (cmd === "userinfo") {
            let member = msg.mentions.users.first() || args[1] || msg.author;
            if(!member) member = msg.guild.members.cache.get(user);
            if(!member) return msg.channel.send(`:x: Diese Person konnte nicht gefunden werden!`);
            function userstat(stat) {
                let status = {
                    online: "https://emoji.gg/assets/emoji/9166_online.png",
                    idle: "https://emoji.gg/assets/emoji/3929_idle.png",
                    dnd: "https://emoji.gg/assets/emoji/2531_dnd.png",
                    offline: "<img src=https://emoji.gg/assets/emoji/7445_status_offline.png/>"
                };
                if(stat === 'online') return status.online;
                if(stat === 'idle') return status.idle;
                if(stat === 'dnd') return status.dnd;
                if(stat === 'offline') return status.offline;
            };
            let userflags = member.flags.toArray();
            let emb = new discord.MessageEmbed()
                .setThumbnail(member.avatarURL({dynamic: true, size: 512}))
                .setColor(member.displayHexColor)
                .addField('User', [
                    `**> Username:** ${member.username}`,
                    `**> Tag:** ${member.discriminator}`,
                    `**> ID:** ${member.id}`,
                    `**> Flags:** ${userflags.length ? userflags.map(flag => flags[flag]).join(', ') : 'None'}`,
                    `**> Avatar:** ${member.avatarURL({dynamic: true})}`,
                    `**> Time Created:** ${moment(member.createdTimestamp).format('LT')} ${moment(member.createdTimestamp).format('LL')} ${moment(member.createdTimestamp).format('LL')} ${moment(member.createdTimestamp).fromNow()}`,
                    `**> Status:** ${member.presence.status}`,
                    `**> Game:** ${member.presence.game}`,
                    `**> Server Join Date:** ${moment(member.joinedAt).format('LL LTS')}`,
                    '\u200b'
                ])
            msg.channel.send(emb);
        }
        if(cmd === "serverinfo") {
            const emb = new discord.MessageEmbed()
            .setAuthor(msg.guild.name, msg.guild.iconURL())
            .setThumbnail(msg.guild.iconURL())
            .addField(`Inhaber`, msg.guild.owner, true)
            .addField(`ID`, msg.guild.id, true)
            .addField(`Mitglieder`, msg.guild.memberCount, true)
            .addField(`Bots`, msg.guild.members.filter(mem => mem.user.bot === true).size, true)
            .addField(`Online`, msg.guild.members.filter(mem => mem.presence.status != "offline").size, true)
            .addField(`Offline`, msg.guild.members.filter(mem => mem.presence.status === "offline").size, true)
            .addField(`Rollen`, msg.guild.roles.cache.size, true)
            .addField(`Verifizierungslevel`, msg.guild.verificationLevel, true)
            .addField(`Erstellungsdatum`, moment.utc(msg.guild.createdAt).utcOffset(+2).format("dddd, MMMM Do YYYY, HH:mm:ss"), true)
            msg.channel.send(emb);
        }
         if (cmd === "countdown") {
            if (args[1] === "silvester") {
                   console.log(cfg.silvcntchid)
                for(var i = 0; i < cfg.silvcntchid.length; i++){
                    if (!(cfg.silvcntchid[i] === msg.channel.id)) {
                        cfg.silvcntchid.push(msg.channel.id);
                        msg.reply(cfg.silvcntchid)
                    } 
                }
                msg.reply(`OK ${cfg.silvcntchid.length}`)
                setInterval(() => {
                    var dl = '1/1/2021';
                    var getSilvTime = `${getTimeRemaining(dl).days}d:${getTimeRemaining(dl).hours}h:${getTimeRemaining(dl).minutes}m`;
                    var emb = new discord.MessageEmbed()
                    .setColor("#DD2C00")
                    .setTitle("TTS - Time To Silvester")
                    .setDescription("SilvesterCountdown!")
                    .addFields(
                        { name: 'Countdown:', value: `${getSilvTime}` },
                        { name: 'Über mir findest du den Countdown!', value: '\u200B', inline: true },
                        { name: '\u200B', value: '\u200B' },
                    )
                    .setFooter(foot, avat)
                    msg.channel.send(emb)
                }, 60000);
            }
        }
         if(msg.content === cfg.prefix + "login") {
             msgOutput(msg)
             abfrageName(msg.author.id, msg);
         }
         if(msg.content === cfg.prefix + "logout") {
             msgOutput(msg)
             msg.member.removeRole('630052023487823882');
             msg.reply("Du wurdest Abgemeldet!")
         }  
*/

        if (msg.content === cfg.prefix + "ping") {
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
        }   
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
            if(args[1] === 'invite') {
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("CMD: jc!invite")
                .setDescription("Dieser Command sendet dir den Invite-Link dieses Bots.")
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
            if(args[1] === 'ping') {
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("CMD: jc!ping")
                .setDescription("Dieser Command sendet die Bot-Latency!")
                .setFooter(foot, avat)
                msg.channel.send(emb);
            } else {
                var emb = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle("Du brauchst Hilfe?")
                .setDescription("Hier findest du alle Commands:\n`jc!help\njc!invite\njc!chatsetup`\nMit jc!help <cmd> kannst du dir mehr Infos anzeigen lassen.")
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
                    emb.setDescription(`Anscheinend willst du meinen Globalchat verwenden! Deshalb habe ich einen Textkanal erstellt der 'jc-chat' heißt. Dies ist mein Globalchat! Viel Spaß`)
                    emb.setFooter(foot, avat)
                    msg.channel.send("", emb).then((m) => {
                        message = m;
                    }); 
                }
            }
        }
        if(cmd === "userinfo") {
            if(args[1].toLowerCase() === "mc" || args[1].toLowerCase() === "minecraft") {
                mcUserInfo.fetch(args[2], "dasisteintestundgehtnochnicht", (res) => {
                    
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
                    .addField('\u200B', '**Past Usernames:**', false)

                    for(let i = 0; i<res[2].length; i++) {
                        emb.addField(res[2][i], '\u200B', true);
                    }

                    msg.channel.send(emb);
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

        if(msg.content === cfg.prefix + "invite") {
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);
            var emb = new discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Der Invite Link")
            .setDescription("Du möchtest den Bot auch auf deinem Server haben? Dann gib http://bit.ly/thejakobbot im Browser ein! Viel Spaß")
            .setFooter(foot, avat)
            msg.channel.send(emb);
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
    bot.sendMessage(msg.chat.id, `Der Owner dieses Bots ist @TheJakobCraft! Mehr Infos findet man auf Discord!`);
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