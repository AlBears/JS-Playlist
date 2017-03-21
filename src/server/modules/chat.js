import { ModuleBase } from '../lib/module';

import { validateSendMessage } from 'shared/validation/chat';
import { fail } from 'shared/observable-socket';

const MAX_HISTORY = 100;
const BATCH_SIZE = 10;

export class ChatModule extends ModuleBase {
	constructor(io, usersModule) {
		super();
		this._io = io;
		this._users = usersModule;
		this._chatLog = [];
	}

	sendMessage(user, message, type) {
		message = message.trim();

		const validator = validateSendMessage(user, message, type);
		if (!validator.isValid)
			return validator.throw$();

		const newMessage = {
			user: { name: user.name, color: user.color },
			message,
			time: new Date().getTime(),
			type
		};

		this._chatLog.push(newMessage);

		if (this._chatLog.length >= MAX_HISTORY)
			this._chatLog.splice(0, BATCH_SIZE);

		this._io.emit('chat:added', newMessage);
	}

	registerClient(client) {
		client.onActions({
			'chat:list': () => {
				return this._chatLog;
			},
			'chat:add': ({ message, type }) => {
				type = type || 'normal';

				const user = this._users.getUserForClient(client);
				if (!user)
					return fail('You must be logged in');

				this.sendMessage(user, message, type);

			}
		});
	}
}
