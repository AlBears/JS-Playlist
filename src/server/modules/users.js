import _ from 'lodash';
import { Observable } from 'rxjs';

import { ModuleBase } from '../lib/module';
import { validateLogin } from 'shared/validation/users';
import { fail } from 'shared/observable-socket';

const AuthContext = Symbol('AuthContext');

export class UsersModule extends ModuleBase {
	constructor(io) {
		super();
		this._io = io;
		this._userList = [];
		this._users = {};
	}

	getColorForUsername(username) {
		let hash = _.reduce(username,
			(hash, ch) => ch.charCodeAt(0) + (hash << 6) + (hash << 16) - hash, 0);

		hash = Math.abs(hash);
		const hue = hash % 360,
			saturation = hash % 25 + 70,
			lightness = 100 - (hash % 15 + 35);

		return `hsl(${hue}, ${saturation}%, ${lightness}%)`;

	}

	getUserForClient(client) {
		const auth = client[AuthContext];
		return auth ? auth : null;
	}

	loginClient$(client, username) {
		username = username.trim();

		const validator = validateLogin(username);
		if (!validator.isValid)
			return validator.throw$();

		if (this._users.hasOwnProperty(username))
			return fail(`Username ${username} is already taken`);

		const auth = client[AuthContext] || (client[AuthContext] = {});
		if (auth.isLoggedIn)
			return fail("You are already logged in");

		auth.name = username;
		auth.color = this.getColorForUsername(username);
		auth.isLoggedIn = true;

		this._users[username] = client;
		this._userList.push(auth);

		this._io.emit("users:added", auth);
		console.log(`User ${username} logged in`);
		return Observable.of(auth);
	}

	registerClient(client) {
		client.onActions({
			"users:list" : () => {
				console.log('USERS LIST');
				return this._userList;
			},

			"auth:login" : ({name}) => {
				return this.loginClient$(client, name);
			},
			"auth:logout" : () => {

			}
		});
	}
}
