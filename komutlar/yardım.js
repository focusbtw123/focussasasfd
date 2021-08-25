const {Discord, MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json')
exports.run = async(client, message, args) => {
    let prefix = ayarlar.prefix;

    message.channel.send(
        new MessageEmbed()
        .setAuthor(ayarlar.bot.botadi + " Yardım")
        .setDescription(`
🚀 Sunucu Sayısı: \`${client.guilds.cache.size}\`
👱‍♂️ Kullanıcı Sayısı: \`${client.users.cache.size}\`
🔉 Kanal Sayısı: \`${client.channels.cache.size}\`

\`\`\`fix
Sistemler
\`\`\`

\`Davet sistemi\` => **${prefix}davet**
\`Destek sistemi\` => **${prefix}destek**
\`Özel Oda sistemi\` => **${prefix}özeloda**

\`\`\`fix
Komutlar
\`\`\`

\`Botun gecikmesi\` => **${prefix}ping**
\`Kullanıcı bilgi\` => **${prefix}bilgi [<kullanıcı>]**
        `)
        .setColor(ayarlar.bot.anarenk)
        .setFooter(ayarlar.bot.footer)
    )

};
exports.help = {
    name: "yardım"
}

exports.conf = {
    aliases: ["help", "yardim"]
}