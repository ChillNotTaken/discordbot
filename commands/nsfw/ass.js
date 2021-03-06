const Command = require('../../structures/Command');
const Discord = require('discord.js');
const axios = require('axios');
const { ERROR_LOG } = require('../../config').logs;
const { errorMessage } = require('../../util/logHandler');
const ErrorEnum = require('../../util/errorTypes.json');
const errors = require('../../assets/json/errors');


module.exports = class AssCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ass',
			aliases: ['butt', 'booty', 'butts'],
			group: 'nsfw',
			memberName: 'ass',
			guildOnly: true,
			description: 'A random picture of...ASS!!',
			examples: ['!ass'],
			details: 'This command can only be used in NSFW channels!',
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
			await axios.get('http://api.obutts.ru/butts/', {
				params: {
					'id':id,
				},
			})
				.then(function(res) {


					return message.channel.send({ embed:  new Discord.MessageEmbed()
						.setFooter('http://obutts.ru/')
						.setImage(`http://media.obutts.ru/${res.data[0].preview}`)
						.setColor('#CEA0A6') });
				})
				.catch(function(err) {
					message.client.channels.cache.get(ERROR_LOG).send({ embed: errorMessage(err, ErrorEnum.API, message.command.name) });
				});


		}
	}
};
