const ayarlar = require('../ayarlar.json');
const sure = 2
const sahipbeklemesi = false 
let yazma = new Set();

module.exports = async message => {
  let prefix = ayarlar.prefix
const args = message.content
    .slice(prefix.length)
    .trim()
    .split(/ +/g);  
  let client = message.client;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = args.shift().toLowerCase();
if (command.length === 0) return;
  let params = message.content.split(' ').slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
    if (yazma.has(message.author.id)) {
		const beklememesaji = `Lütfen ${sure} saniye bekleyiniz. Teşekürler!` 
      return message.channel.send(beklememesaji);
    }
  } else if (client.aliases.has(command)) {
    if (yazma.has(message.author.id)) {
		const beklememesaji = `Lütfen ${sure} saniye bekleyiniz. Teşekürler!` 

      return message.channel.send(beklememesaji);
    }
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {

    if (perms < cmd.conf.permLevel) return;
    if(sahipbeklemesi === false) {
      yazma.add(message.author.id);
    } if(sahipbeklemesi === true) {
      if(message.author.id === ayarlar.sahip) {
        cmd.run(client, message, params, perms);
        return true;
      }
    }
    setTimeout(() => {
      if(yazma.has(message.author.id)) {
        yazma.delete(message.author.id);
      }
    }, sure * 1000);
    cmd.run(client, message, params, perms);
  }


};