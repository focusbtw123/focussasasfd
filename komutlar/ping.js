const {Discord, MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json')
exports.run = async(client, message, args) => {

    message.channel.send(
        new MessageEmbed()
        .setAuthor(ayarlar.bot.botadi + " Gecikme")
        .setDescription(`
🚀 Bot Gecikmesi: \`${client.ws.ping} ms\`
📰 Mesaj Gecikmesi: \`${message.createdTimestamp - Date.now()} ms\`
        `)
        .setColor(ayarlar.bot.anarenk)
        .setFooter(ayarlar.bot.footer)
    )

};
exports.help = {
    name: "ping"
}

exports.conf = {
    aliases: ["gecikme"]
}