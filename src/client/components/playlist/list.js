import $ from 'jquery';
import moment from 'moment';


import { ElementComponent } from "../../lib/component";


import { PlaylistSortComponent } from './sort';

export class PlaylistListComponent extends ElementComponent {
	constructor(playlistStore, usersStore) {
		super('ul');
		this._playlist = playlistStore;
		this._users = usersStore;
		this.$element.addClass('playlist-list');
	}

	_onAttach() {
		const $list = this.$element;
		let itemsMap = {};
		//------------------------------
		// Child component
		const sort = new PlaylistSortComponent();
		sort.attach(this._$mount);
		this.children.push(sort);

		//-----------------------------------
		// Playlist
		this._playlist.state$
			.filter(a => a.type === "list")
			.compSubscribe(this, ({ state }) => {
				$list.empty();
				itemsMap = {};
				for (let source of state.list) {
					const comp = new PlaylistItemComponent(source);
					itemsMap[source.id] = comp;
					comp.attach($list);
				}
			});

		this._playlist.state$
			.filter(a => a.type === "add")
			.compSubscribe(this, ({ source, addAfter }) => {
				const comp = new PlaylistItemComponent(source);
				comp.attach($list);

				itemsMap[source.id] = comp;
				this._addItem(comp, addAfter ? itemsMap[addAfter.id] : null);
			});

	}

	_addItem(comp, addAfterComp) {
		if (addAfterComp)
			addAfterComp.$element.after(comp.$element);
		else {
			this.$element.prepend(comp.$element);

			const oldHeight = comp.$element.height();
			comp.$element
			.addClass("selected")
			.css({ height: 0, opacity: 0 })
			.animate({ height: oldHeight, opacity: 1 }, 250, () => {
				comp.$element
					.removeClass("selected")
					.css({ height: "", opacity: "" });
			});

		}
	}
}

class PlaylistItemComponent extends ElementComponent {
	constructor(source) {
		super('li');
		this._source = source;

		const $thumb = $(`<div class="thumb-wrapper" />`).append(
			$(`<img class="thumb" />`).attr('src', source.thumb));

		const $details =
			$(`<div class="details" />`).append([
				$(`<span class="title" />`).attr('title', source.title).text(source.title),
				$(`<time />`).text(moment.duration(source.totalTime, 'seconds').format())
			]);

		this._$progress = $(`<span class="progress" />`);
		this.$element.append($(`<div class="inner" />`).append([
			$thumb,
			$details,
			this._$progress]));
	}
}
