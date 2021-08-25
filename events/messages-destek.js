const {Discord, MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json')
const {JsonDatabase} = require('wio.db')
let destek = new Set();

module.exports = async message => {
    let db = new JsonDatabase("database/genel");
    let prefix = ayarlar.prefix;
    if(db.fetch(`${message.guild.id}.destek`) != null) {
        if(message.author.bot) return;
        let destekdb = new JsonDatabase("database/destek");
        let genelDestekDB = db.fetch(`${message.guild.id}.destek`);
        if(message.channel.id == genelDestekDB.kanal) {
            let getServerId = genelDestekDB.id || 0;
            let getUserDestekId = destekdb.fetch(`${message.guild.id}.${message.author.id}.talep-id`);
            let destekKanal = message.guild.channels.cache.find(c => c.name.toLowerCase() === "destek-" + getUserDestekId)
            let destekGörevli = message.guild.roles.cache.find(r => r.id == genelDestekDB.rol.gorevli);
            let kategori = genelDestekDB.kategori.aktif;
            message.delete();
            if(message.content.length <= 5) return message.channel.send(`${message.member}, Lütfen Destek konusunu \`5\` karakterden yüksek yapınız.`).then(s => s.delete({timeout:3000}))
            if(!destekKanal) {
                if(destekGörevli) {
                    new JsonDatabase("database/genel").add(`${message.guild.id}.destek.id`, 1);
                    destekdb.set(`${message.guild.id}.${message.author.id}.talep-id`, getServerId);
                    message.guild.channels.create("destek-" + getServerId).then(x => {
                        if(kategori) {
                            x.setParent(kategori)
                        }
                        x.overwritePermissions([{
                            id: message.member.id,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                        },
                        {
                            id: message.guild.roles.everyone.id,
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                        }, 
                        {
                            id: destekGörevli,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                        }
                    ]);

                    x.send(
                        `${message.author} && ${destekGörevli}`,
                        new MessageEmbed()
                       .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                       .setDescription(`
👦 ${message.author}, Destek görevlilerimiz,
en kısa sürede sizinle ilgilenecektir.

🎫 Destek talep'ini kapatmak için "${prefix}kapat" yazınız.

🗨 Destek Konusu:
\`\`\`
${message.content}
\`\`\`
                       `)
                       .setColor(ayarlar.bot.anarenk)
                       .setFooter(ayarlar.bot.footer)
                    );
                });

                } else {
                    message.channel.send(`${message.author}, Sunucuda destek görevlisi ayarlanmamış.`).then(s => s.delete({timeout:3000}))
                }
            } else {
                destekKanal.send(`${message.author}, Lütfen sorununuzu buraya yazınız.`).then(s => s.delete({timeout:3000}))

            }

        }
        if(message.content == prefix + "kapat") {
            if(message.channel.name.startsWith("destek-")) {
                let destekID = message.channel.name.split("-");
                let genelDestekDB = db.fetch(`${message.guild.id}.destek`);
                let destekGörevli = message.guild.roles.cache.find(r => r.id == genelDestekDB.rol.gorevli);
                message.channel.setName(`arşiv-${destekID[1]}`).then(x => {
                    if(genelDestekDB.kategori.arsiv) {
                        x.setParent(genelDestekDB.kategori.arsiv);
                    }
                    x.overwritePermissions([
                        {
                            id: message.guild.roles.everyone.id,
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        }, 
                        {
                            id: destekGörevli,
                            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                        }
                    ]);
                });
                let log = message.guild.channels.cache.find(c => c.name == "destek-log");

                if(log) {
                    log.send(
                        new MessageEmbed()
                        .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                        .setDescription(`
${message.member}, adlı kişi \`${message.channel.name}\` kanalındaki,
desteğ'i sona erdirdi.
                        `)
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                    )
                }
            }
        }
    }
};