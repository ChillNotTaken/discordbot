const Command = require('../../structures/Command');
const Discord = require('discord.js');
const axios = require('axios');
const { ERROR_LOG } = require('../../config').logs;
const { errorMessage } = require('../../util/logHandler');
const ErrorEnum = require('../../util/errorTypes.json');


module.exports = class DadJokeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dadjoke',
			aliases: ['dadpun', 'joke', 'pun'],
			group: 'fun',
			memberName: 'dadjoke',
			guildOnly: true,
			description: 'Get a random dad joke!',
			examples: ['~dadjoke'],
			throttling: {
				usages: 1,
				duration: 3,
			},
		});
	}

	async run(message) {

		await axios.get('https://icanhazdadjoke.com/', {
			headers: { 'Accept': 'application/json' },
		})
			.then(function(res) {
				const msg = new Discord.MessageEmbed()
					.setAuthor('Here\'s a joke!', 'https://a.safe.moe/X1gKJ.png')
					.setDescription(res.data.joke)
					.setColor('#727684');

				return message.channel.send({ embed: msg });
			})
			.catch(function(err) {
				message.client.channels.cache.get(ERROR_LOG).send({ embed: errorMessage(err, ErrorEnum.API, message.command.name) });
			});


	}
};
