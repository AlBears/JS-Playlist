import { Observable } from 'rxjs';

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
