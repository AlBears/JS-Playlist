import { Observable } from 'rxjs';

import { validateAddSource } from 'shared/validation/playlist';

export class PlaylistStore {
	constructor(server) {
		const defaultState = { current: null, list: [], map: {} };

		this._server = server;

		const events$ = Observable.merge(
			server.on$('playlist:list').map(opList));

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
