import $ from 'jquery';
import { ComponentBase } from '../../lib/component';

import './chat.scss';

import { usersStore, chatStore, server } from '../../services';

import { ChatListComponent } from './list';
import { ChatFormComponent } from './form';

class ChatComponent extends ComponentBase {
	constructor(server, usersStore, chatStore) {
		super();
		this._server = server;
		this._users = usersStore;
		this._chat = chatStore;

	}

	_onAttach() {
		const $title = this._$mount.find("> h1");
		$title.text('');

		const list = new ChatListComponent(this._server, this._users, this._chat);
		list.attach(this._$mount);
		this.children.push(list);

		const form = new ChatFormComponent(this._users, this._chat);
		form.attach(this._$mount);
		this.children.push(form);
	}
}

let component;
try {
	component = new ChatComponent(server, usersStore, chatStore);
	component.attach($("section.chat"));
} catch (e) {
	console.error(e);
	if (component)
		component.detach();
}
finally {
	if (module.hot) {
		module.hot.accept();
		module.hot.dispose(() => component && component.detach());
	}
}
