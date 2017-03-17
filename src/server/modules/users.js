import { ModuleBase } from '../lib/module';

export class UsersModule extends ModuleBase {
	constructor(io) {
		super();
		this._io = io;
	}
}
