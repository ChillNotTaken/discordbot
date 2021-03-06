const Command = require('../../structures/Command');
const Discord = require('discord.js');
const axios = require('axios');
const { ERROR_LOG } = require('../../config').logs;
const { errorMessage } = require('../../util/logHandler');
const ErrorEnum = require('../../util/errorTypes.json');
const errors = require('../../assets/json/errors');


module.exports = class BoobsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'boobs',
			aliases: ['boobies', 'bobs'],
			group: 'nsfw',
			memberName: 'boobs',
			guildOnly: true,
			description: 'Show a picture of boobs!',
			details: 'This command can only be used in NSFW channels!',
			examples: ['!boobs'],
			throttling: {
				usages: 1,
				duration: 3,
			},
		});
	}

	async run(message) {
		const errMessage = errors[Math.round(Math.random() * (errors.length - 1))];
		if (!message.channel.nsfw) {
			message.react('💢');
			return message.channel.send(errMessage);

		}
		else {

			const id = [Math.floor(Math.random() * 4923)];
			await axios.get('http://api.oboobs.ru/boobs/', {
				params: {
					'id':id,
				},
			})
				.then(function(res) {


					return message.channel.send({ embed:  new Discord.MessageEmbed()
						.setFooter('http://oboobs.ru/')
						.setImage(`http://media.oboobs.ru/${res.data[0].preview}`)
						.setColor('#CEA0A6') });
				})
				.catch(function(err) {
					message.client.channels.cache.get(ERROR_LOG).send({ embed: errorMessage(err, ErrorEnum.API, message.command.name) });
				});


		}
	}
};
