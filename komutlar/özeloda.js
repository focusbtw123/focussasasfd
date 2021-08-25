const {Discord, MessageEmbed } = require('discord.js');
const { JsonDatabase } = require('wio.db');
const ayarlar = require('../ayarlar.json')
exports.run = async(client, message, args) => {
    let prefix = ayarlar.prefix;
    let db = new JsonDatabase("database/genel")
    const hata = new MessageEmbed()
    .setAuthor(ayarlar.bot.botadi + " Özel Oda Sistemi")
    .setDescription(`
\`${prefix}özeloda kur\` => Özel Oda sistemini kurar.
\`${prefix}özeloda kapat\` => Özel Oda sistemini kapatır.
    `)
    .setColor(ayarlar.bot.anarenk)
    .setFooter(ayarlar.bot.footer);

    if(args.length == 0) {
        message.channel.send(hata);
    } else if(args.length >= 1) {
        if(args[0] == "kur") {
            let kategori;
            message.guild.channels.create("Özel Oda", {type: "category"}).then(x => {
                db.set(`${message.guild.id}.ozeloda.kategori`, x.id)
                kategori = x;
            })
            message.guild.channels.create("Özel Oda kur", {type: "voice"}).then(x => {
                db.set(`${message.guild.id}.ozeloda.kanal`, x.id)
                x.setParent(kategori.id)
                message.channel.send(
                    new MessageEmbed()
                    .setAuthor(ayarlar.bot.botadi + " Özel Oda Sistemi")
                    .setDescription(`
Özel oda sistemi başarılı bir şekilde kuruldu!
    
Kanal: ${x}
                    `)
                    .setColor(ayarlar.bot.anarenk)
                    .setFooter(ayarlar.bot.footer)
                )
            })
        } else if(args[0] == "kapat") {
            db.delete(`${message.guild.id}.ozeloda`);
            message.channel.send(
                new MessageEmbed()
                .setAuthor(ayarlar.bot.botadi + " Özel Oda Sistemi")
                .setDescription(`
Özel Oda Sistemi kapatıldı!

Not: \`Sunucuya ait tüm veriler silindi.\`
                `)
                .setFooter(ayarlar.bot.footer)
                .setColor(ayarlar.bot.anarenk)
            )
        } else {
            message.channel.send(hata);
        }
    }

};
exports.help = {
    name: "özeloda"
}

exports.conf = {
    aliases: ["özel-oda", "ozeloda", "ozel-oda"]
}