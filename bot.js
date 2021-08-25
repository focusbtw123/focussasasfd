const {Collection, MessageEmbed, Client} = require('discord.js');
const client = new Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const moment = require('moment');
var Jimp = require('jimp');
const fs = require('fs');
const {JsonDatabase} = require('wio.db');
const http = require('http');
const express = require('express');
require('./util/eventLoader.js')(client);
const path = require('path');
const snekfetch = require('snekfetch');
var prefix = ayarlar.prefix;
client.commands = new Collection();
client.aliases = new Collection();
fs.readdir('./komutlar/', (err, files) => {
    if (err) console.error(err);
    console.log(`${files.length} komut yüklenecek.`);
    files.forEach(f => {
        let props = require(`./komutlar/${f}`);
        console.log(`Yüklenen komut: ${props.help.name}.`);
        client.commands.set(props.help.name, props);
        props.conf.aliases.forEach(alias => {
            client.aliases.set(alias, props.help.name);
        });
    });
});
client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};
client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};
client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }
    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

client.login(ayarlar.token);

require(`./davet-manager.js`)(client);

client.on(`channelDelete`, (channel) => {
    if(channel.type === "category") {
        let db = new JsonDatabase("database/genel");
        let genelDestekDB = db.fetch(`${channel.guild.id}.destek`);
        if(!genelDestekDB) return;
        if(channel.id === genelDestekDB.kategori.arsiv) {
            db.delete(`${channel.guild.id}.destek.kategori.arsiv`);
        } else if(channel.id === genelDestekDB.kategori.aktif) {
            db.delete(`${channel.guild.id}.destek.kategori.aktif`);
        }
    } else if(channel.type == "text") {
        let db = new JsonDatabase("database/genel");
        let genelDestekDB = db.fetch(`${channel.guild.id}.destek`);
        if(!genelDestekDB) return;
        if(channel.id == genelDestekDB.kanal) {
            db.delete(`${channel.guild.id}.destek.kanal`)
        }
    }
})
client.on(`roleDelete`, (role) => {
    let db = new JsonDatabase("database/genel");
    let genelDestekDB = db.fetch(`${role.guild.id}.destek`);
    if(!genelDestekDB) return;
    if(role.id === genelDestekDB.destek.ro.gorevli) {
        db.delete(`${role.guild.id}.destek.rol.gorevli`);
    }
})
client.on(`guildMemberRemove`, member => {
    if(member.id == client.user.id) {
        let db = new JsonDatabase("database/genel");
        let destkdb = new JsonDatabase("database/destek");
        let davetdb = new JsonDatabase("database/inviters");
        
        if(db.has(`${member.guild.id}`)) {
            db.delete(`${member.guild.id}`);
        }
        if(destekdb.has(`${member.guild.id}`)) {
            destekdb.delete(`${member.guild.id}`);
        }
        if(davetdb.has(`${member.guild.id}`)) {
            davetdb.delete(`${member.guild.id}`);
        }
    }
})