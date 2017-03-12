import { ElementComponent } from '../../lib/component';

export class ChatListComponent extends ElementComponent {
	constructor() {
		super('ul');
		this.$element.addClass("chat-messages");
	}
}
