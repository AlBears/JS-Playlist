import $ from 'jquery';
import { ComponentBase } from '../../lib/component';

import './chat.scss';

import { usersStore } from '../../services';

import { ChatListComponent } from './list';
import { ChatFormComponent } from './form';

class ChatComponent extends ComponentBase {
	constructor(usersStore) {
		super();
		this._users = usersStore;
	}

	_onAttach() {
		const $title = this._$mount.find("> h1");
		$title.text('');

		const list = new ChatListComponent();
		list.attach(this._$mount);
		this.children.push(list);

		const form = new ChatFormComponent(this._users);
		form.attach(this._$mount);
		this.children.push(form);
	}
}

let component;
try {
	component = new ChatComponent(usersStore);
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
