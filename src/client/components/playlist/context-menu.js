import $ from 'jquery';
import { Subject, Observable } from 'rxjs';

import { ElementComponent } from "../../lib/component";

export class PlaylistContextMenuComponent extends ElementComponent {
	constructor(playlistStore, usersStore, $list) {
		super('div');
		this.$element.addClass('context-menu');

		this._playlist = playlistStore;
		this._users = usersStore;
		this._$list = $list;
	}

	_onAttach() {
		/* eslint-disable no-unused-vars*/
		const $playButton = $(`
			<a href="#" class="play">
				<i class="fa fa-play-circle" /> Play
			</a>
		`).appendTo(this.$element);

		const $deleteButton = $(`
			<a href="#" class="delete">
				<i class="fa fa-trash" /> Delete
			</a>
		`).appendTo(this.$element);

		const selectedItemSubject$ = new Subject();

		const openMenuOnItem$ = Observable.fromEventNoDefault(this._$list, "contextmenu")
			.map(event => $(event.target).closest("li").data("component"));

		const closeMenu$ = Observable.fromEvent($("body"), "mouseup")
			.filter(event => $(event.target).closest("li.selected, .context-menu").length == 0)
			.mapTo(null);

		const selectedItem$ = Observable.merge(openMenuOnItem$, closeMenu$, selectedItemSubject$)
			.filter(() => this._users.isLoggedIn)
			.share();

		let lastItem = null;
		selectedItem$
			.compSubscribe(this, item => {
				if (lastItem)
					lastItem.isSelected = false;

				lastItem = item;
				if (!item) {
					this.$element.removeClass("open");
					return;
				}

				item.isSelected = true;
				this.$element.addClass("open");

				const contextMenuHeight = this.$element.outerHeight();
				const itemHeight = item.$element.outerHeight();
				const itemPosition = item.$element[0].offsetTop;

				const targetPosition = itemPosition + itemHeight + contextMenuHeight > this._$list[0].scrollHeight
					? itemPosition - contextMenuHeight
					: itemPosition + itemHeight;

				this.$element.css("top", targetPosition);
			});

		const setCurrentItem$ = Observable.fromEventNoDefault($playButton, "click")
			.map(() => comp => this._playlist.setCurrentSource$(comp.source));

		const deleteItem$ = Observable.fromEventNoDefault($deleteButton, "click")
			.map(() => comp => this._playlist.deleteSource$(comp.source));

		Observable.merge(setCurrentItem$, deleteItem$)
			.withLatestFrom(selectedItem$)
			.flatMap(([op, item]) => op(item).catchWrap())
			.compSubscribe(this, response => {
				if (response && response.error)
					alert(response.error.message || "Unknown Error");
				else
					selectedItemSubject$.next(null);
			});
	}
}
