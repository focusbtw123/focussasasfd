const {Discord, MessageEmbed } = require('discord.js');
const ayarlar = require('../ayarlar.json')
const {JsonDatabase} = require('wio.db')
exports.run = async(client, message, args) => {
    if(!message.member.hasPermission("MANAGE_GUILD")) return message.reply(ayarlar.noPerm.replace("{perm}", "Sunucuyu Yönet"))
    let db = new JsonDatabase("database/genel")
    let prefix = ayarlar.prefix;

    const hata = new MessageEmbed()
    .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
    .setDescription(`
\`${prefix}destek kanal [<kanal>]\` => Destek kanal'ını ayarlar. 
\`${prefix}destek kategori [<arşiv/aktif>] [<kategori adı>]\` => Destek taleplerinin kategorisini ayarlar. 
\`${prefix}destek görevli [<rol>]\` => Destek taleplerindeki kontrolcü'yü ayarlar. 
\`${prefix}destek kapat\` => Destek sistemini kapatır. (Tüm verileri temizler.) 
    `)
    .setColor(ayarlar.bot.anarenk)
    .setFooter(ayarlar.bot.footer)


    if(args.length == 0) {
        message.channel.send(hata);
    } else if (args.length >= 1) {

        if(args[0] === "kanal") {
            let kanal = getChannelFromMention(args[1])
            if(kanal) {
                db.set(`${message.guild.id}.destek.kanal`, kanal.id)
                message.channel.send(
                    new MessageEmbed()
                    .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                    .setDescription(`
Destek sistemi kanalı başarılı şekilde ayarlandı!

Kanal: \`${kanal.name}\`
                    `)
                    .setColor(ayarlar.bot.anarenk)
                    .setFooter(ayarlar.bot.footer)
                )
            } else {
                message.channel.send(hata);
            }
        } else if(args[0] === "kategori") {
            
            if(args[1] === "aktif") {

                let kategori = message.guild.channels.cache.find(c => 
                     c.name == args.slice(2).join(" ") && c.type === "category");
                /*
                Üsteki kod Hata verirse bu kodu kullanın (Uzaltılmış);
                let kategori;
                kategoriler.forEach(c => {
                    if(c.name == args.slice(2).join(" ")) {
                        kategori = c;
                    }
                });
                */

                if(kategori) {
                    db.set(`${message.guild.id}.destek.kategori.aktif`, kategori.id);
                    message.channel.send(
                        new MessageEmbed()
                        .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                        .setDescription(`
Aktif destekler kategorisi başarılı şekilde ayarlandı!

Kategori: \`${kategori.name}\`
                        `)
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                    )
                } else {
                    message.channel.send("Hata: Kategori bulunamadı.", hata)
                }
                

            } else if(args[1] === "arşiv" || args[1] === "arsiv") {
                let kategori = message.guild.channels.cache.find(c => 
                    c.name == args.slice(2).join(" ") && c.type === "category");
               /*
               Üsteki kod Hata verirse bu kodu kullanın (Uzaltılmış);
               let kategori;
               kategoriler.forEach(c => {
                   if(c.name == args.slice(2).join(" ")) {
                       kategori = c;
                   }
               });
               */

               if(kategori) {
                   db.set(`${message.guild.id}.destek.kategori.arsiv`, kategori.id);
                   message.channel.send(
                       new MessageEmbed()
                       .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                       .setDescription(`
Arşivlenmiş destekler kategorisi başarılı şekilde ayarlandı!

Kategori: \`${kategori.name}\`
                       `)
                       .setColor(ayarlar.bot.anarenk)
                       .setFooter(ayarlar.bot.footer)
                   )
                   message.guild.channels.create("destek-log").then(x => {
                        x.setParent(kategori.id)
                        x.overwritePermissions([{
                            id: message.guild.roles.everyone.id,
                            deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"],
                        }]);
                   })
               } else {
                   message.channel.send("Hata: Kategori bulunamadı.", hata)
               }
            }

        } else if(args[0] === "görevli" || args[0] === "gorevli") {
            let rol = message.mentions.roles.first();
            if(rol) {
                db.set(`${message.guild.id}.destek.rol.gorevli`, rol.id);
                   message.channel.send(
                       new MessageEmbed()
                       .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                       .setDescription(`
Destek görevlisi rolü başarılı şekilde ayarlandı!

Rol: \`${rol.name}\`
                       `)
                       .setColor(ayarlar.bot.anarenk)
                       .setFooter(ayarlar.bot.footer)
                   )
            } else {
                message.channel.send("Hata: Rol bulunamadı.", hata)
            }
        } else if(args[0] == "kapat") {
            db.delete(`${message.guild.id}.destek`);
            message.channel.send(
                new MessageEmbed()
                .setAuthor(ayarlar.bot.botadi + " Destek Sistemi")
                .setDescription(`
Destek Sistemi kapatıldı!

Not: \`Sunucuya ait tüm veriler silindi.\`
                `)
                .setFooter(ayarlar.bot.footer)
                .setColor(ayarlar.bot.anarenk)
            )
        } else {
            message.channel.send(hata);
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

};
exports.help = {
    name: "destek"
}

exports.conf = {
    aliases: ["ticket"]
}