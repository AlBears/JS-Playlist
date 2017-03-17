import { Observable } from 'rxjs';
import _ from 'lodash';

export class UsersStore {
	constructor(server) {
		this._server = server;

		// Users List
		const defaultStore = { users: [] };
		const events$ = Observable.merge(
			this._server.on$("users:list").map(opList),
			this._server.on$("users:added").map(opAdd));

		this.state$ = events$
			.scan(({ state }, op) => op(state), { state: defaultStore })
				.publishReplay(1);

		this.state$.connect();

		// Bootstrap
		this._server.on("connect", () => {
			this._server.emit("users:list");
		});
	}
}

function opList(users) {
	return state => {
		state.users = users;
		state.users.sort((l, r) => l.name.localeCompare(r.name));
		return {
			type: "list",
			state
		};
	};
}

function opAdd(user) {
	return state => {
		let insertIndex = _.findIndex(state.users,
			u => u.name.localeCompare(user.name) > 0);

		if (insertIndex === -1)
			insertIndex = state.users.length;

		state.users.splice(insertIndex, 0, user);
		return {
			type: "add",
			user,
			state
		};
	};
}
