const {Discord, MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json')
const {JsonDatabase} = require('wio.db')
exports.run = async(client, message, args) => {

    if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(ayarlar.noPerm.replace("{perm}", "Sunucuyu Yönet"))
    const prefix = ayarlar.prefix;
    const db = new JsonDatabase("database/genel")
    let davetdb = new JsonDatabase("database/inviters")

    const hata = new MessageEmbed()
    .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
    .setDescription(`
\`${prefix}davet kanal [<kanal>]\` => Davet Log kanalı.
\`${prefix}davet ekle [<Üye>] [<sayı>]\` => Bir üyeye belirli sayıda davet ekler.
\`${prefix}davet sil [<Üye>] [<sayı>]\` => Bir üyeden belirli sayıda davet siler.
\`${prefix}davet mesaj [<giriş/çıkış>] [<Mesaj>]\` => Özel mesaj ayarlar.
\`${prefix}davet kapat\` => Davet Sistemini kapatır (Tüm Verileri temizler!).


**Özel Mesaj Değişkenleri**:

\`{davetci}
{üye}
{toplamdavet}
{toplamüye}\`

Not: \`Mesaj ayarlamada yeni satıra geçmek,
için mesajınızda yeni satıra geçiniz.\`

**Örnek:**
    `)
    .setImage("https://i.imgur.com/92Tb6mP.png")
    .setColor(ayarlar.bot.anarenk)
    .setFooter(ayarlar.bot.footer)


    if(args.length == 0) {
        message.channel.send(hata)
    } else if(args.length >= 1) {
        if(args[0] == "kanal") {
            let kanal = getChannelFromMention(args[1]);
            if(kanal) {
                message.channel.send(
                    new MessageEmbed()
                    .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                    .setDescription(`
Davet Kanalı başarılı şekilde ayarlandı!

Kanal: \`${kanal.name}\`
                    `)
                    .setColor(ayarlar.bot.anarenk)
                    .setFooter(ayarlar.bot.footer)

                )
                db.set(`${message.guild.id}.davet.kanal`, kanal.id)
            } else {
                message.channel.send(hata)
            }
        } else if (args[0] == "mesaj") {
            if(args[1] == "giriş" || args[1] == "giris") {

                let mesaj = args.slice(2).join(" ");
                if(mesaj) {
                    db.set(`${message.guild.id}.davet.giris.mesaj`, mesaj);
                    message.channel.send(
                        new MessageEmbed()
                        .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                        .setDescription(`
Davet giriş mesajı,
\`\`\`${mesaj}\`\`\`
olarak ayarlandı.

Örnek:
${mesaj
    .replace("{davetci}", message.member)
    .replace("{toplamdavet}", Math.floor(Math.random() * 9999))
    .replace("{toplamüye}", message.guild.memberCount)
    .replace("{üye}", message.guild.members.cache.random().user)
}
                        `)
                    )
                } else {
                    message.channel.send(hata)
                }
            } else if(args[1] == "çıkış" || args[1] == "cikis") {
                let mesaj = args.slice(2).join(" ");
                if(mesaj) {
                    db.set(`${message.guild.id}.davet.cikis.mesaj`, mesaj);
                    message.channel.send(
                        new MessageEmbed()
                        .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                        .setDescription(`
Davet çıkış mesajı,
\`\`\`${mesaj}\`\`\`
olarak ayarlandı.

Örnek:
${mesaj
    .replace("{davetci}", message.member)
    .replace("{toplamdavet}", Math.floor(Math.random() * 9999))
    .replace("{toplamüye}", message.guild.memberCount)
    .replace("{üye}", message.guild.members.cache.random().user)
}
                        `)
                    )
                } else {
                    message.channel.send(hata)
                }
            }
        } else if(args[0] === "ekle") {
            let uye = getUserFromMention(args[1]);
            let sayi = parseInt(args[2]);
            
            if(uye) {
                if(sayi) {

                    davetdb.add(`${message.guild.id}.toplam.davetler.${uye.id}`, sayi);
                    davetdb.add(`${message.guild.id}.fake.davetler.${uye.id}`, sayi);
                    message.channel.send(
                        new MessageEmbed()
                        .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                        .setDescription(`
${uye} adlı kişiye \`${sayi}\` Davet eklendi!

Eski Davetleri: ${davetdb.fetch(`${message.guild.id}.toplam.davetler.${uye.id}`) - sayi}
Yeni Davetleri: ${davetdb.fetch(`${message.guild.id}.toplam.davetler.${uye.id}`)}
                        `)
                    )
                    

                } else {
                    message.channel.send(hata)
                }
            }else {
                message.channel.send(hata)
            }
        } else if(args[0] == "sil") {
            let uye = getUserFromMention(args[1]);
            let sayi = parseInt(args[2]);
            
            if(uye) {
                if(sayi) {

                    if(davetdb.fetch(`${message.guild.id}.toplam.davetler.${uye.id}`) >= sayi) {
                        davetdb.substr(`${message.guild.id}.toplam.davetler.${uye.id}`, sayi);
                        davetdb.substr(`${message.guild.id}.fake.davetler.${uye.id}`, sayi);
                        message.channel.send(
                            new MessageEmbed()
                            .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                            .setColor(ayarlar.bot.anarenk)
                            .setFooter(ayarlar.bot.footer)
                            .setDescription(`
${uye} adlı kişiden \`${sayi}\` Davet silindi!

Eski Davetleri: ${davetdb.fetch(`${message.guild.id}.toplam.davetler.${uye.id}`) + sayi}
Yeni Davetleri: ${davetdb.fetch(`${message.guild.id}.toplam.davetler.${uye.id}`)}
                            `)
                        )
                        
                    } else {
                        message.channel.send(
                            new MessageEmbed()
                            .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                            .setColor(ayarlar.bot.anarenk)
                            .setFooter(ayarlar.bot.footer)
                            .setDescription(`
${uye} adlı kişide \`${sayi}\` Davet yok!
                            `)
                        )
                    }
                } else {
                    message.channel.send(hata)
                }
            }else {
                message.channel.send(hata)
            }
        } else if(args[0] == "kapat") {
            davetdb.delete(`${message.guild.id}`);
            db.delete(`${message.guild.id}`);
            message.channel.send(
                new MessageEmbed()
                .setAuthor(ayarlar.bot.botadi + " Davet Sistemi")
                .setColor(ayarlar.bot.anarenk)
                .setFooter(ayarlar.bot.footer)
                .setDescription(`
Davet Sistemi kapatıldı!

Not: \`Sunucuya ait tüm veriler silindi.\`
                `)
            )
        } else {
            message.channel.send(hata)
        }
    }

    function getChannelFromMention(mention) {
        if (!mention) return;
    
        if (mention.startsWith('<#') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);
    
            if (mention.startsWith('!')) {
                  mention = mention.slice(1);
            }
    
            return client.channels.cache.get(mention);
        }
    }

    function getUserFromMention(mention) {
        if (!mention) return;
    
        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);
    
            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }
    
            return client.users.cache.get(mention);
        }
    }
};
exports.help = {
    name: "davet"
}

exports.conf = {
    aliases: ["invite"]
}