const {JsonDatabase} = require("wio.db");
const {Collection} = require("discord.js");
const ses = new Collection();
module.exports = async (oldState, newState) => {
    
    let db = new JsonDatabase("database/genel");
    let ÖzelOdaDB = db.fetch(`${newState.guild.id}.ozeloda`);
    if(!ÖzelOdaDB) return;
    const kullanıcı = newState.guild.members.cache.get(newState.id)
    if(!oldState.channel && newState.channel.id === ÖzelOdaDB.kanal) {
        let kategori = newState.guild.channels.cache.find(x => x.id == ÖzelOdaDB.kategori && x.type == "category");
        const kanal = newState.guild.channels.create("Özel Oda" + " - " + kullanıcı.user.username, {type: "voice"}).then(x => {
            x.setParent(kategori);
            kullanıcı.voice.setChannel(x);
        })
    } else if(newState.channe != oldState.channel) {
        if(oldState.channel.name === "Özel Oda - " + kullanıcı.user.username) 
            return oldState.channel.delete();
    }
}