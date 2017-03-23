import { Observable } from 'rxjs';

import { ModuleBase } from '../lib/module';
import { fail } from 'shared/observable-socket';
import { validateAddSource } from 'shared/validation/playlist';

export class PlaylistModule extends ModuleBase {
	constructor(io, usersModule, playlistRepository, videoServices) {
		super();

		this._io = io;
		this._users = usersModule;
		this._repository = playlistRepository;
		this._services = videoServices;
	}

	init$() {
		return this._repository.getAll$().do(this.setPlaylist.bind(this));
	}

	setPlaylist(playlist) {
		this._playlist = playlist;

		for (let source of playlist)
			source.id = this._nextSourceId++;

		this._io.emit('playlist:list', this._playlist);
	}

	addSourceFromUrl$(url) {
		const validator = validateAddSource(url);
		if (!validator.isValid)
			return validator.throw$();

		return new Observable(observer => {
			let getSource$ = null;

			for (let service of this._services) {
				getSource$ = service.process$(service);

				if (getSource$)
					break;
			}

			if (!getSource$)
				return fail(`No service accepted url ${url}`);

			getSource$
				.do(this.addSource.bind(this))
				.subscribe(observer);
		});
	}

	addSource(source) {

	}

	registerClient(client) {
		const isLoggedIn = () => this._users.getUserForClient(client) !== null;

		client.onActions({
			'playlist:list': () => {
				return this._playlist;
			},

			'playlist:add': ({ url }) => {
				if (!isLoggedIn())
					return fail('You must be logged in to do that');

				return this.addSourceFromUrl$(url);
			}
		});
	}
}
