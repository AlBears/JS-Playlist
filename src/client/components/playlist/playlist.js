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
