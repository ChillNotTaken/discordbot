const Command = require('../../structures/Command');
const Discord = require('discord.js');
const axios = require('axios');
const { ERROR_LOG } = require('../../config').logs;
const { errorMessage } = require('../../util/logHandler');
const ErrorEnum = require('../../util/errorTypes.json');
const { disgustP } = require('../../assets/json/actions.json');

module.exports = class LickCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'lick',
			aliases: ['slurp'],
			group: 'action',
			memberName: 'lick',
			guildOnly: true,
			description: 'Licks the user you mentioned!',
			examples: ['~lick <user>'],
			throttling: {
				usages: 1,
				duration: 3,
			},
		});
	}

	async run(message) {
		const recipient = message.content.split(/\s+/g).slice(1).join(' ');
		const disgust = disgustP[Math.round(Math.random() * (disgustP.length - 1))];

		if (!recipient) {
			var embed = new Discord.MessageEmbed()
				.setColor('#FBCFCF')
				.setImage(disgust);
			return message.channel.send(`${message.author} licks... themselves..?`, { embed: embed });

		}
		else if (message.mentions.users.first() == message.author) {
			var embed = new Discord.MessageEmbed()
				.setColor('#FBCFCF')
				.setImage(disgust);
			return message.channel.send(`${message.author} licks... themselves..?`, { embed: embed });

		}
		else if (message.mentions.users.first() == this.client.user) {


			await axios.get('https://rra.ram.moe/i/r?type=lick')
				.then(function(res) {
					const embed = new Discord.MessageEmbed()
						.setColor('#FBCFCF')
						.setImage(`https://rra.ram.moe${res.data.path}`);
					return message.channel.send('Nyaa..♡(｡￫ˇ艸￩) where are you...licking me...', { embed: embed });
				})
				.catch(function(error) {
					// handle error

					message.client.channels.cache.get(error_log).send({ embed: errorMessage(error, ErrorEnum.API, message.command.name) });

				});


		}
		else {


			await axios.get('https://rra.ram.moe/i/r?type=lick')
				.then(function(res) {
					const embed = new Discord.MessageEmbed()
						.setColor('#FBCFCF')
						.setImage(`https://rra.ram.moe${body.path}`);
					return message.channel.send(`${message.author} licks ${recipient}!`, { embed: embed });
				})
				.catch(function(error) {
					// handle error
					console.log(error);
				});


		}
	}
};
