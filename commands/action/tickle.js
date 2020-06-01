const { Command } = require('discord.js-commando');
const Discord = require('discord.js');
const axios = require('axios');
const { disgustP } = require('../../assets/json/actions.json');
const {error_log } = require('../../config');
const {errorMessage} = require('../../functions/logHandler');
const ErrorEnum = require('../../functions/errorTypes');

module.exports = class TickleCommand extends Command {
    constructor(client) {
        super(client, {
            name: 'tickle',
            group: 'action',
            memberName: 'tickle',
            guildOnly: true,
            description: 'Tickles the user you mentioned!',
            examples: ['~tickle <user>'],
            throttling: {
                usages: 1,
                duration: 3
            }
        });
    }

    async run(message) {
        var recipient = message.content.split(/\s+/g).slice(1).join(" ");
        var disgust = disgustP[Math.round(Math.random() * (disgustP.length - 1))]

        if (!recipient) {
            var embed = new Discord.MessageEmbed()
                .setColor('#FBCFCF')
                .setImage(disgust);
            return message.channel.send(`${message.author} tickles... themselves..?`, { embed: embed });

        } else if (message.mentions.users.first() == message.author) {
            var embed = new Discord.MessageEmbed()
                .setColor('#FBCFCF')
                .setImage(disgust);
            return message.channel.send(`${message.author} tickles... themselves..?`, { embed: embed });

        } else if (message.mentions.users.first() == this.client.user) {

            await axios.get('https://rra.ram.moe/r?type=tickle')
                .then(function(res){
                    var embed = new Discord.MessageEmbed()
                    .setColor('#FBCFCF')
                    .setImage(`https://rra.ram.moe${res.data.path}`);
                return message.channel.send(`NyaAhaha! ⊂(( ^ ▽ ^ ))⊃`, { embed: embed });
                })
                .catch(function(err){
                    message.client.channels.cache.get(error_log).send({embed: errorMessage(err,ErrorEnum.API,message.command.name)});

                });



            

        } else {



            await axios.get('https://rra.ram.moe/i/r?type=tickle')
                .then(function(res){
                    return message.channel.send(`${message.author} tickles ${recipient}!`, { embed: new Discord.MessageEmbed().setColor('#FBCFCF').setImage(`https://rra.ram.moe${res.data.path}`)});
                })
                .catch(function(err){
                    message.client.channels.cache.get(error_log).send({embed: errorMessage(err,ErrorEnum.API,message.command.name)});
                })

        }
    }
}