const Discord = require('discord.js');
const axios = require('axios');
const Command = require('../../structures/Command');
const { ERROR_LOG } = require('../../config').logs;
const { errorMessage } = require('../../util/logHandler');
const ErrorEnum = require('../../util/errorTypes.json');


function getRndInteger(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}


module.exports = class DoesNotExistCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dne',
			aliases: ['dne'],
			group: 'memes',
			memberName: 'dne',
			description: 'Replies with the 5 latest news articles for the requested topic',
		});
	}

	async run(message) {


		await axios.get('https://api.imgflip.com/get_memes')
			.then(function(res) {

				const index = getRndInteger(0, res.data.data.memes.length);


				const embed = new Discord.MessageEmbed()
					.setFooter('MEME')
					.setDescription(`${res.data.data.memes[index].name}`)
					.setImage(res.data.data.memes[index].url)
					.setColor('#A187E0');
				return message.channel.send({ embed });


			})
			.catch(function(error) {
				// handle error

				message.client.channels.cache.get(ERROR_LOG).send({ embed: errorMessage(error, ErrorEnum.API, message.command.name) });

			});


	}


};
