const {Discord, MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json')
const {JsonDatabase} = require('wio.db')
exports.run = async(client, message, args) => {

    let kullanici = message.mentions.members.first() || message.author;
    const db = new JsonDatabase("database/genel")
    let davetdb = new JsonDatabase("database/inviters")
    if(kullanici != null) {

        message.channel.send(
            new MessageEmbed()
            .setAuthor(ayarlar.bot.botadi + " Bilgi")
            .setTitle(kullanici.tag||kullanici.user.tag)
            .setColor(ayarlar.bot.anarenk)
            .setFooter(ayarlar.bot.footer)
            .setDescription(`
🔢 Davet Sayısı: \`(Toplam: ${davetdb.fetch(`${message.guild.id}.toplam.davetler.${kullanici.id}`) || 0}  | Gerçek: ${davetdb.fetch(`${message.guild.id}.gercek.davetler.${kullanici.id}`)  ||0} | Fake: ${davetdb.fetch(`${message.guild.id}.fake.davetler.${kullanici.id}`) || 0})\`

🚀 Davet Eden: ${client.users.cache.get(davetdb.fetch(`${message.guild.id}.davetci.${kullanici.id}`)) || "Bulunamadı"}

📜 Durum: ${kullanici.presence.status
    .replace("dnd", "Rahatsız Etme 🔴")
    .replace("idle", "Boşta 🟠")
    .replace("online", "Çevrimiçi 🟢")
    .replace("offline", "Çevrimdışı ⚫")
}
            `)
        )

    }

};
exports.help = {
    name: "bilgi"
}

exports.conf = {
    aliases: ["info"]
}