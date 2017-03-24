import { Observable } from 'rxjs';

import { validateAddSource } from 'shared/validation/playlist';

export class PlaylistStore {
	constructor(server) {
		const defaultState = { current: null, list: [], map: {} };

		this._server = server;

		const events$ = Observable.merge(
			server.on$('playlist:list').map(opList),
			server.on$('playlist:added').map(opAdd));

		this.state$ = events$
			.scan(({ state }, op) => op(state), { state: defaultState })
			.publishReplay(1);

		this.state$.connect();

		server.on('connect', () => {
			server.emit('playlist:list');
		});
	}

	addSource$(url) {
		const validator = validateAddSource(url);
		if (!validator.isValid)
			return Observable.throw({ message: validator.message });

		return this._server.emitAction$('playlist:add', { url });
	}
}

function opList(sources) {
	return state => {
		state.current = null;
		state.list = sources;
		state.map = sources.reduce((map, source) => {
			map[source.id] = source;
			return map;
		}, {});

		return {
			type: 'list',
			state
		};
	};
}

function opAdd({ source, afterId }) {
	return state => {
		let insertIndex = 0,
			addAfter = null;

		if (afterId !== -1) {
			addAfter = state.map[afterId];
			if (!addAfter)
				return opError(state, `Could not add source ${source.title} after ${afterId}, as ${afterId} was not found`);

			const afterIndex = state.list.indexOf(addAfter);
			insertIndex = afterIndex + 1;
		}

		state.list.splice(insertIndex, 0, source);
		return {
			type: "add",
			source,
			addAfter,
			state
		};
	};
}

function opError(state, error) {
	console.error(error);
	return {
		type: "error",
		error,
		state
	};
}
