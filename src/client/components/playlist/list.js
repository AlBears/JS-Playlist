import $ from 'jquery';
import moment from 'moment';
import { Observable } from 'rxjs';


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
		const sort = new PlaylistSortComponent(this._playlist, this._users, this.$element);
		sort.attach(this._$mount);
		this.children.push(sort);

		//-----------------------------------
		// Playlist
		Observable.merge(
			this._playlist.state$.first(),
			this._playlist.actions$.filter(a => a.type === "list"))
			.compSubscribe(this, ({ state }) => {
				$list.empty();
				itemsMap = {};
				for (let source of state.list) {
					const comp = new PlaylistItemComponent(source);
					itemsMap[source.id] = comp;
					comp.attach($list);
				}
			});


		this._playlist.actions$
			.filter(a => a.type === "add")
			.compSubscribe(this, ({ source, addAfter }) => {
				const comp = new PlaylistItemComponent(source);
				comp.attach($list);

				itemsMap[source.id] = comp;
				this._addItem(comp, addAfter ? itemsMap[addAfter.id] : null);
			});

		this._playlist.actions$
			.filter(a => a.type === 'remove')
			.compSubscribe(this, ({source}) => {
				const comp = itemsMap[source.id];
				this._removeItem(comp);
			});
		//-----------------------------------
		// Current item
		let lastComp = null;
		this._playlist.serverTime$
			.compSubscribe(this, current => {
				if (current.source == null) {
					if (lastComp != null) {
						lastComp.isPlaying = false;
						lastComp = null;
					}

					return;
				}

				const currentComp = itemsMap[current.source.id];
				if (currentComp == null) {
					console.error(`Cannot find component for ${current.source.id}/${current.source.title}`);
					return;
				}

				if (lastComp != currentComp) {
					if (lastComp != null)
						lastComp.isPlaying = false;

					lastComp = currentComp;
					currentComp.isPlaying = true;

					const scrollTop = currentComp.$element.offset().top -
						this.$element.offset().top +
						this.$element.scrollTop() -
						currentComp.$element.height() * 2;

					this._$mount.animate({ scrollTop });
				}

				currentComp.progress = current.progress;
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

	_removeItem(comp) {
		comp.$element
			.addClass('remove')
			.animate({opacity: 0, height: 0}, 250, () => {
				comp.detach();
			});
	}
}

class PlaylistItemComponent extends ElementComponent {
	set isPlaying(isPlaying) {
		this._setClass("is-playing", isPlaying);
	}

	set isSelected(isSelected) {
		this._setClass("selected", isSelected);
	}

	set progress(progress) {
		this._$progress.css("width", `${progress}%`);
	}

	get source() {
		return this._source;
	}

	constructor(source) {
		super('li');
		this._source = source;

		const $thumb = $(`<div class="thumb-wrapper" />`).append(
			$(`<img class="thumb" />`).attr('src', source.thumb));

		const $details =
			$(`<div class="details" />`).append([
				$(`<span class="title" />`).attr("title", source.title).text(source.title),
				$(`<time />`).text(moment.duration(source.totalTime, "seconds").format())
			]);

		this._$progress = $(`<span class="progress" />`);
		this.$element.append($(`<div class="inner" />`).append([
			$thumb,
			$details,
			this._$progress]));
	}
}
