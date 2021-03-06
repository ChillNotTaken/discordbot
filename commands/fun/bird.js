const Command = require('../../structures/Command');
const Discord = require('discord.js');
const axios = require('axios');
const { ERROR_LOG } = require('../../config').logs;
const { errorMessage } = require('../../util/logHandler');
const ErrorEnum = require('../../util/errorTypes.json');
const up = true;

module.exports = class BirdCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bird',
			aliases: ['birb', 'burb', 'birbo'],
			group: 'fun',
			memberName: 'bird',
			guildOnly: true,
			description: 'Sends a random picture of a bird!',
			examples: ['~bird'],
			throttling: {
				usages: 1,
				duration: 5,
			},
		});
	}

	async run(message) {


		if(!up) {
			await axios.get('http://random.birb.pw/tweet/')
				.then(function(res) {

					const msg = new Discord.MessageEmbed()
						.setImage(`http://random.birb.pw/img/${res.data.image}`)
						.setFooter('http://random.birb.pw/ ©', 'http://random.birb.pw/img/BPVpe.jpg')
						.setColor('#71A3BE');

					return message.channel.send({ embed: msg });
				})
				.catch(function(err) {
					message.client.channels.cache.get(ERROR_LOG).send({ embed: errorMessage(err, ErrorEnum.API, message.command.name) });
				});

		}
		else {
			message.say('Bird Img API is Offline');
		}


	}
};
