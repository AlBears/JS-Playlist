import $ from 'jquery';
import { ElementComponent } from '../../lib/component';

import './users.scss';

class UsersComponent extends ElementComponent {
	constructor() {
		super("ul");
		this.$element.addClass("users");
	}

	_onAttach() {
		const $title = this._$mount.find("> h1");
		$title.text('Users');
	}
}

let component;
try {
	component = new UsersComponent();
	component.attach($("section.users"));
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
