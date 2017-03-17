import { ModuleBase } from '../lib/module';

export class ChatModule extends ModuleBase {
	constructor(io, usersModule) {
		super();
		this._io = io;
		this._users = usersModule;
	}
}
