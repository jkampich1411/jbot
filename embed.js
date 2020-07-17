const { RichEmbed } = require('discord.js');

const COLORS = {
    red: 0xDD2C00,
    blue: 0x2196F3,
    green: 0x4CAF50
}


module.exports = {

    error(chan, cont, title) {
        var message
        var emb = new RichEmbed()
            .setColor(COLORS.red)
            .setDescription(cont)
        if (title) { 
            emb.setTitle(title)

        }
        chan.send('', emb).then( (m) => {
            message = m;
        });
        return message;
    }
}