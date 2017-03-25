import { Observable } from 'rxjs';

import { validateAddSource } from 'shared/validation/playlist';

export class PlaylistStore {
	constructor(server) {
		const defaultState = { current: null, list: [], map: {} };

		this._server = server;

		const events$ = Observable.merge(
			server.on$('playlist:list').map(opList),
			server.on$('playlist:added').map(opAdd),
			server.on$('playlist:current').map(opCurrent));

		this.actions$ = events$
			.scan(({ state }, op) => op(state), { state: defaultState })
			.publish();

		this.state$ = this.actions$
			.publishReplay(1)
			.startWith({state: defaultState});

		this.serverTime$ = this.actions$
			.filter(a => a.type == "current")
			.map(a => a.state.current)
			.publishReplay(1);

		this.actions$.connect();
		this.serverTime$.connect();

		server.on('connect', () => {
			server.emitAction$('playlist:list')
				.subscribe(() => {
					server.emit("playlist:current");
				});
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

function opCurrent({ id, time }) {
	return state => {
		const source = state.map[id];
		if (!source)
			return opError(state, `Cannot find item with id ${id}`);

		if (!state.current || state.current.source != source) {
			state.current = {
				source,
				time,
				progress: calculateProgress(time, source)
			};
		} else {
			state.current.time = time;
			state.current.progress = calculateProgress(time, source);
		}

		return {
			type: "current",
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

function calculateProgress(time, source) {
	return Math.floor(Math.min(time / source.totaltime, 1) * 100);
}
