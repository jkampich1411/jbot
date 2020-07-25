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
const embeds = require('./embed');
const ytdl = require("ytdl-core");
const moment = require("moment");
const TelegramBot = require('node-telegram-bot-api');
const { isAbsolute } = require('path');
require("moment-duration-format");
moment.locale('de');

// DISCORD
var client = new discord.Client;
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
    // var con = mysql.createConnection({
    //     host: "remotemysql.com",
    //     user: "Mo5fs8XahO",
    //     password: "dJQlwYqVdh",
    //     database: "Mo5fs8XahO"
    //   });
    client.on('ready', () => {
        console.log(`Eingeloggt als ${client.user.username}`);
        console.log(`Auf ${client.guilds.cache.size} Servern!`)
        // con.connect(function(err) {
        //     if (err) throw err;
        //     con.query(`SELECT * FROM users`, function (err, result, fields) {
        //       if (err) throw err;
        //       console.log(result);
        //     });
        //   });
        client.user.setStatus('dnd')
        client.user.setPresence({
            game: {
                name: `Auf ${client.guilds.size} Servern | jc!help`,
                type: "Streaming",
                url: ""
            }
        });
    });
    client.on('reconnecting', () => {
        console.log("Verbindet neu!");
    });
    client.on('disconnect', () => {
        console.log("Verbindung trennen");
    });
    client.on('voiceStateUpdate', (oldMember, newMember) => {
        let newUserChannel = newMember.voiceChannel;
        let oldUserChannel = oldMember.voiceChannel;
        if(oldUserChannel === undefined && newUserChannel !== undefined) {
            if(newUserChannel.id === '727512957474570243') {
                
            }


        } else if(newUserChannel === undefined) {

        };
    });
    client.on('message', (msg) => { 
        if(msg.author.bot) return;
        const args = msg.content.trim().split(/ +/g);
        const cmd = args[0].slice(cfg.prefix.length).toLowerCase();
        const foot = `Angefragt von ${msg.author.tag} | Auf ${client.guilds.cache.size} Servern`;
        const avat = msg.author.avatarURL();

        if(msg.channel.name == "jc-chat" && msg.author.id != client.user.id) {
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);             
            client.channels.cache.filter(c => c.name == "jc-chat").forEach(channel => {                 
                var embed = new discord.MessageEmbed()
                .setColor("#DD2C00")
                .setTitle(msg.author.tag)
                .setDescription(msg.content)
                .setFooter(msg.member.guild.name + " | " + `Auf ${client.guilds.cache.size} Servern`, avat)
                channel.send(embed)    
            });             
            return;
        }
        if (cmd === "userinfo") {
            let member = msg.mentions.users.first() || args[1] || msg.author;
            let msgu = msg.guild.member(member);
            let userinf = {};

            userinf.avatar = member.avatarURL;
            userinf.name = member.username;
            userinf.discrim = `#${member.discriminator}`;
            userinf.id = member.id;
            userinf.status = member.presence.status;
            userinf.registered = moment.utc(member.createdAt).utcOffset(+2).format("dddd, MMMM Do YYYY, HH:mm:ss");
            userinf.joined = moment.utc(msgu.joinedAt).utcOffset(+2).format("dddd, MMMM Do YYYY, HH:mm:ss");
            var emb = new discord.MessageEmbed()
            .setAuthor(member.tag, userinf.avatar)
            .setThumbnail(userinf.avatar)
            .addField(`Username`, userinf.name, true)
            .addField(`Tag`, userinf.discrim, true)
            .addField(`ID`, userinf.id, true)
            .addField(`Status`, userinf.status, true)
            .addField(`Registriert`, userinf.registered, true)
            .addField(`Beigetreten`, userinf.joined, true)
            .setFooter(foot, avat);
            msg.channel.send(emb);
        }
        if(cmd === "serverinfo") {
            const emb = new discord.MessageEmbed()
            .setAuthor(msg.guild.name, msg.guild.iconURL())
            .setThumbnail(msg.guild.iconURL())
            .addField(`Inhaber`, msg.guild.owner, true)
            .addField(`ID`, msg.guild.id, true)
            .addField(`Mitglieder`, msg.guild.memberCount, true)
            .addField(`Bots`, msg.guild.members.cache.filter(mem => mem.user.bot === true).size, true)
            .addField(`Online`, msg.guild.members.cache.filter(mem => mem.presence.status != "offline").size, true)
            .addField(`Offline`, msg.guild.members.cache.filter(mem => mem.presence.status === "offline").size, true)
            .addField(`Rollen`, msg.guild.roles.cache.size, true)
            .addField(`Verifizierungslevel`, msg.guild.verificationLevel, true)
            .addField(`Erstellungsdatum`, moment.utc(msg.guild.createdAt).utcOffset(+2).format("dddd, MMMM Do YYYY, HH:mm:ss"), true)
            msg.channel.send(emb);
        }
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
                .setDescription("Dieser Command erstellt dir einen Kanal Namens: `#jc-chat`. Dies ist mein Globalchat.")
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
        if(cmd === "ban") {
            if (msg.member.hasPermission("BAN_MEMBERS")) {
                var res;
                if (!args[2]) {
                    res = 'res';
                } else {
                    res = args[2];
                }
                var usr = msg.mentions.members.first();
                if (usr) {
                    var banned = msg.guild.member(usr);
                    if (banned) {
                        banned.ban({
                            reason: res,
                        }).catch(err => {
                            throw err;
                        });
                    }
                }
            } else return;
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);
        }
        if(cmd === "kick") {
            if (msg.member.hasPermission("KICK_MEMBERS")) {
                var res;
                if (!args[2]) {
                    res = 'res';
                } else {
                    res = args[2];
                }
                var user = msg.mentions.members.first();
                if (user) {
                    var kicked = msg.guild.member(user);
                    if(kicked) {
                        kicked.kick(res)
                        .catch(err => {
                            throw err;
                        });
                    }
                }
            } else return;
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);
        }
        // if(msg.content === cfg.prefix + "login") {
        //     msgOutput(msg)
        //     abfrageName(msg.author.id, msg);
        // }
        // if(msg.content === cfg.prefix + "logout") {
        //     msgOutput(msg)
        //     msg.member.removeRole('630052023487823882');
        //     msg.reply("Du wurdest Abgemeldet!")
        // }  
        if(msg.content === cfg.prefix + "testcmd") {
            embeds.error(msg.channel, 'das ist kein fehler', 'test');
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
        if(msg.content === cfg.prefix + "invite") {
            msg.delete()
            .then(msg => console.log(``))
            .catch(console.error);
            var emb = new discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle("Der Invite Link")
            .setDescription("Du möchtest den Bot auch auf deinem Server haben? Dann gib https://discord.com/oauth2/authorize?client_id=533660748816318496&scope=bot&permissions=8 im Browser ein! Viel Spaß")
            .setFooter(foot, avat)
            msg.channel.send(emb);
        }
    });

client.login(cfg.token);

// Twitch

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
//iamjakob