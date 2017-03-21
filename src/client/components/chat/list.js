import $ from 'jquery';

import { ElementComponent } from '../../lib/component';

export class ChatListComponent extends ElementComponent {
	constructor(server, usersStore, chatStore) {
		super('ul');
		this._server = server;
		this._users = usersStore;
		this._chat = chatStore;
		this.$element.addClass("chat-messages");
	}

	_onAttach() {
		this._chat.messages$.compSubscribe(this, message => {
			this.$element.append($(`<li />`).text(message.message));
		});
	}
}
