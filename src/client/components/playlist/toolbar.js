import $ from 'jquery';
import { Observable } from 'rxjs';

import {ElementComponent} from "../../lib/component";

export class PlaylistToolbarComponent extends ElementComponent {
	constructor(playlistStore) {
		super('div');
		this._playlist = playlistStore;
		this.$element.addClass('toolbar');
	}

	_onAttach() {
		const $addButton = $(`
			<a href="#" class="add-button">
				<i class="fa fa-plus-square" /> next
			</a>
		`).appendTo(this.$element);

		Observable.fromEventNoDefault($addButton, 'click')
			.flatMap(() => Observable.fromPrompt('Enter the url of the video'))
			.filter(url => url && url.trim().length)
			.flatMap(url => this._playlist.addSource$(url))
			.compSubscribe(this, result => {
				if (result && result.error)
					alert(result.error.message || "Unknown Error");
			});
	}
}
