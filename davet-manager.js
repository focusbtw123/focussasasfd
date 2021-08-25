module.exports = client => {
    const {JsonDatabase} = require('wio.db');
    const guildInvites = new Map();
    const ayarlar = require('./ayarlar.json');
    const {MessageEmbed} = require('discord.js');

client.on('inviteCreate', async invite => guildInvites.set(invite.guild.id, await invite.guild.fetchInvites()));
client.on('ready', () => {
    client.guilds.cache.forEach(guild => {
        guild.fetchInvites()
            .then(invites => guildInvites.set(guild.id, invites))
            .catch(err => console.log(err));
    });
});
//Giriş
client.on('guildMemberAdd', async member => {
    if (member.guild) {
        let db = new JsonDatabase("database/genel")
        if(db.fetch(`${member.guild.id}.davet.kanal`) != null) {
            let davetdb = new JsonDatabase("database/inviters")
            const kayitliDavetler = guildInvites.get(member.guild.id);
            const yeniDavetler = await member.guild.fetchInvites();
            guildInvites.set(member.guild.id, yeniDavetler);
            const kanal = member.guild.channels.cache.get(db.fetch(`${member.guild.id}.davet.kanal`));
            let mesaj;
            if(!db.fetch(`${member.guild.id}.davet.giris.mesaj`)) {
                mesaj = `
Aramıza hoşgeldin {üye}!

💎 Davet Eden: {davetci}
🔢 Davet Sayısı: {toplamdavet}
👱‍♂️ Toplam Üye: {toplamüye}
                `
            } else {
                mesaj = `
${db.fetch(`${member.guild.id}.davet.giris.mesaj`)}
                `
            }

            try {
                const davetKod = yeniDavetler.find(inv => kayitliDavetler.get(inv.code).uses < inv.uses);
                
                if(davetKod.inviter.id == member.id) {
                    kanal.send(
                        new MessageEmbed()
                        .setTitle(ayarlar.bot.botadi + " Davet")
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                        .setDescription(`
${mesaj
    .replace("{davetci}", "Self-Davet")
    .replace("{toplamdavet}", davetdb.fetch(`${member.guild.id}.davetler.${member.id}`) || 0)
    .replace("{toplamüye}", member.guild.memberCount)
    .replace("{üye}", member)
}
                        `)
                    )
                } else {
                    davetdb.add(`${member.guild.id}.gercek.davetler.${davetKod.inviter.id}`, 1)
                    davetdb.add(`${member.guild.id}.toplam.davetler.${davetKod.inviter.id}`, 1)
                    davetdb.set(`${member.guild.id}.davetci.${member.id}`, davetKod.inviter.id)
                    
                    kanal.send(
                        new MessageEmbed()
                        .setTitle(ayarlar.bot.botadi + " Davet")
                        .setColor(ayarlar.bot.anarenk)
                        .setFooter(ayarlar.bot.footer)
                        .setDescription(`
${mesaj
    .replace("{davetci}", davetKod.inviter)
    .replace("{toplamdavet}", davetdb.fetch(`${member.guild.id}.toplam.davetler.${davetKod.inviter.id}`) || 0)
    .replace("{toplamüye}", member.guild.memberCount)
    .replace("{üye}", member)
}
                        `)
                    )
                }
                
            }
            catch (e) {
                kanal.send(
                    new MessageEmbed()
                    .setTitle(ayarlar.bot.botadi + " Davet")
                    .setColor(ayarlar.bot.anarenk)
                    .setFooter(ayarlar.bot.footer)
                    .setDescription(`
${mesaj
    .replace("{davetci}", "Bilinmiyor")
    .replace("{toplamdavet}", "`Davet eden bulunamadı`")
    .replace("{toplamüye}", member.guild.memberCount)
    .replace("{üye}", member)
}
                    `)
                )
            }
        }
    }
});
// Çıkış
client.on("guildMemberRemove", member => {
    if(member.guild) {
        let db = new JsonDatabase("database/genel")
        if(db.fetch(`${member.guild.id}.davet.kanal`) != null) {
            
            let davetdb = new JsonDatabase("database/inviters")
            const kanal = member.guild.channels.cache.get(db.fetch(`${member.guild.id}.davet.kanal`));
            let mesaj;
            if(!db.fetch(`${member.guild.id}.davet.cikis.mesaj`)) {
                mesaj = `
Aramızdan ayrıldı {üye}!

💎 Davet Eden: {davetci}
🔢 Davet Sayısı: {toplamdavet}
👱‍♂️ Toplam Üye: {toplamüye}
                `
            } else {
                mesaj = `
${db.fetch(`${member.guild.id}.davet.cikis.mesaj`)}
                `
            }

            if(davetdb.fetch(`${member.guild.id}.davetci.${member.id}`) != null) {
                davetdb.substr(`${member.guild.id}.toplam.davetler.${davetdb.fetch(`${member.guild.id}.davetci.${member.id}`)}`, 1)
                davetdb.substr(`${member.guild.id}.gercek.davetler.${davetdb.fetch(`${member.guild.id}.davetci.${member.id}`)}`, 1)
                davetdb.substr(`${member.guild.id}.fake.davetler.${davetdb.fetch(`${member.guild.id}.davetci.${member.id}`)}`, 1)
                kanal.send(
                    new MessageEmbed()
                    .setTitle(ayarlar.bot.botadi + " Davet")
                    .setColor(ayarlar.bot.anarenk)
                    .setFooter(ayarlar.bot.footer)
                    .setDescription(`
${mesaj
    .replace("{davetci}", client.users.cache.get(davetdb.fetch(`${member.guild.id}.davetci.${member.id}`)))
    .replace("{toplamdavet}", davetdb.fetch(`${member.guild.id}.davetler.${davetdb.fetch(`${member.guild.id}.davetci.${member.id}`)}`) || 0)
    .replace("{toplamüye}", member.guild.memberCount)
    .replace("{üye}", member)
}
                    `)
                )
                
                davetdb.delete(`${member.guild.id}.davetci.${member.id}`)
            } else {
                kanal.send(
                    new MessageEmbed()
                    .setTitle(ayarlar.bot.botadi + " Davet")
                    .setColor(ayarlar.bot.anarenk)
                    .setFooter(ayarlar.bot.footer)
                    .setDescription(`
${mesaj
    .replace("{davetci}", "Bulunamadı")
    .replace("{toplamdavet}", "`Davet eden bulunamadı`")
    .replace("{toplamüye}", member.guild.memberCount)
    .replace("{üye}", member)
}
                    `)
                )
            }
        }
    }
});
}