const { DISCORD_TOKEN, DISCORD_OWNER_ID, DISCORD_PREFIX, DISCORD_INVITE } = require('./config').discord;
const path = require('path');
const { Intents, MessageEmbed } = require('discord.js');
const Client = require('./structures/Client');
const { formatNumber } = require('./util/Util');


const client = new Client({
	commandPrefix: DISCORD_PREFIX,
	owner: DISCORD_OWNER_ID,
	invite: DISCORD_INVITE,
	disableMentions: 'everyone',
	partials: ['GUILD_MEMBER'],
	ws: { intents: [Intents.NON_PRIVILEGED, 'GUILD_MEMBERS'] },
});


client.registry
	.registerDefaultTypes()
	.registerTypesIn(path.join(__dirname, 'types'))
	.registerGroups([
		['action', 'Action'],
		['anime', 'Anime'],
		['core', 'Core'],
		['fun', 'Fun'],
		['games-mp', 'Multi-Player Games'],
		['games-sp', 'Single-Player Games'],
		['info', 'Info'],
		['memes', 'Memes'],
		['moderation', 'Moderation'],
		['music', 'Music Commands'],
		['news', 'News'],
		['nsfw', 'NSFW'],
		['numbers', 'Number Commands'],
		['owner', 'Hidden + Owner'],
		['phone', 'Phone Commands'],
		['text', 'Text Commands'],
		['util', 'Utility'],
		['general', 'General'],
		['loyal', 'Loyalty Program Commands'],
		['other', 'Other'],
	])
	.registerDefaultCommands({
		help: false,
		ping: false,
		prefix: false,
		commandState: false,
		unknownCommand: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

client.on('ready', async () => {
	client.logger.info(`[READY] Logged in as ${client.user.tag}! ID: ${client.user.id}`);

	// Push client-related activities
	client.activities.push(
		{ text: () => `${formatNumber(client.guilds.cache.size)} servers`, type: 'WATCHING' },
		{ text: () => `with ${formatNumber(client.registry.commands.size)} commands`, type: 'PLAYING' },
		{ text: () => `${formatNumber(client.channels.cache.size)} channels`, type: 'WATCHING' },
	);

	// Interval to change activity every minute
	client.setInterval(() => {
		const activity = client.activities[Math.floor(Math.random() * client.activities.length)];
		const text = typeof activity.text === 'function' ? activity.text() : activity.text;
		client.user.setActivity(text, { type: activity.type });
	}, 60000);

});

client.on('message', async msg => {
	const hasText = Boolean(msg.content);
	const hasImage = msg.attachments.size !== 0;
	const hasEmbed = msg.embeds.length !== 0;
	if (msg.author.bot || (!hasText && !hasImage && !hasEmbed)) return;
	const origin = client.phone.find(call => call.origin.id === msg.channel.id);
	const recipient = client.phone.find(call => call.recipient.id === msg.channel.id);
	if (!origin && !recipient) return;
	const call = origin || recipient;
	if (call.originDM && call.startUser.id !== msg.author.id) return;
	if (!call.adminCall && (msg.guild && (!msg.channel.topic || !msg.channel.topic.includes('<weaboo:phone>')))) return;
	if (!call.active) return;
	if (call.adminCall && msg.guild.id === call.origin.guild.id && !client.isOwner(msg.author)) return;
	try {
		await call.send(origin ? call.recipient : call.origin, msg, hasText, hasImage, hasEmbed);
	}
	catch {
		return; // eslint-disable-line no-useless-return
	}
});

client.on('guildCreate', async guild => {
	if (guild.systemChannel && guild.systemChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {
		try {
			const usage = client.registry.commands.get('help').usage();
			await guild.systemChannel.send(`Hi! I'm Weaboo, use ${usage} to see my commands, yes?`);
		}
		catch {
			// Nothing!
		}
	}
	const joinLeaveChannel = await client.fetchJoinLeaveChannel();
	if (joinLeaveChannel) {
		if (!guild.members.cache.has(guild.ownerID)) await guild.members.fetch(guild.ownerID);
		const embed = new MessageEmbed()
			.setColor(0x7CFC00)
			.setThumbnail(guild.iconURL({ format: 'png' }))
			.setTitle(`Joined ${guild.name}!`)
			.setFooter(`ID: ${guild.id}`)
			.setTimestamp()
			.addField('❯ Members', formatNumber(guild.memberCount))
			.addField('❯ Owner', guild.owner.user.tag);
		await joinLeaveChannel.send({ embed });
	}
});

client.on('guildDelete', async guild => {
	const joinLeaveChannel = await client.fetchJoinLeaveChannel();
	if (joinLeaveChannel) {
		const embed = new MessageEmbed()
			.setColor(0xFF0000)
			.setThumbnail(guild.iconURL({ format: 'png' }))
			.setTitle(`Left ${guild.name}...`)
			.setFooter(`ID: ${guild.id}`)
			.setTimestamp()
			.addField('❯ Members', formatNumber(guild.memberCount));
		await joinLeaveChannel.send({ embed });
	}
});

client.on('guildMemberRemove', async member => {
	if (member.id === client.user.id) return null;
	if (member.partial) await member.fetch();
	const channel = member.guild.systemChannel;
	if (!channel || !channel.permissionsFor(client.user).has('SEND_MESSAGES')) return null;
	if (channel.topic && channel.topic.includes('<weaboo:disable-leave>')) return null;
	try {
		const leaveMessage = client.leaveMessages[Math.floor(Math.random() * client.leaveMessages.length)];
		await channel.send(leaveMessage.replaceAll('{{user}}', `**${member.user.tag}**`));
		return null;
	}
	catch {
		return null;
	}
});

client.on('disconnect', event => {
	client.logger.error(`[DISCONNECT] Disconnected with code ${event.code}.`);
	process.exit(0);
});

client.on('error', err => client.logger.error(err.stack));

client.on('warn', warn => client.logger.warn(warn));

client.on('commandRun', command => {
	if (command.uses === undefined) return;
	command.uses++;
});


client.on('commandCancel', () => {
	console.log('Command Cancelled!');
});

client.on('voiceStateUpdate', async (___, newState) => {
	if (
		newState.member.user.bot &&
			!newState.channelID &&
			newState.guild.musicData.songDispatcher &&
			newState.member.user.id === client.user.id
	) {
		newState.guild.musicData.queue.length = 0;
		newState.guild.musicData.songDispatcher.end();
	}
});

process.on('unhandledRejection', err => {
	console.error('Uncaught Promise Error! \n' + err.stack);
});

client.on('commandError', (command, err) => client.logger.error(`[COMMAND:${command.name}]\n${err.stack}`));

client.login(DISCORD_TOKEN);
