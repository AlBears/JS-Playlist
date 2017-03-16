import $ from 'jquery';
import { ComponentBase } from '../../lib/component';

import './playlist.scss';

import { PlaylistListComponent } from './list';
import { PlaylistToolbarComponent } from './toolbar';
import { PlaylistContextMenuComponent } from './context-menu';
import { PlaylistChromeComponent } from './chrome';

class PlaylistComponent extends ComponentBase {
	constructor() {
		super();
	}

	_onAttach() {
		const $title = this._$mount.find("> h1");
		$title.text('Playlist');

		const toolbar = new PlaylistToolbarComponent();
		toolbar.attach(this._$mount);

		this._$chrome = $(`<div class="chrome" />`).appendTo(this._$mount);
		this._$scrollArea = $(`<div class="scroll-area" />`).appendTo(this._$chrome);

		const list = new PlaylistListComponent();
		list.attach(this._$scrollArea);

		const contextMenu = new PlaylistContextMenuComponent();
		contextMenu.attach(this._$scrollArea);

		const chrome = new PlaylistChromeComponent();
		chrome.attach(this._$chrome);

		this.children.push(toolbar, list, contextMenu, chrome);

	}

	_onDetach() {
		this._$chrome.remove();
	}
}

let component;
try {
	component = new PlaylistComponent();
	component.attach($("section.playlist"));
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
