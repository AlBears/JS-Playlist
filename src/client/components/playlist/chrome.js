import $ from "jquery";
import moment from "moment";

import {ComponentBase} from "../../lib/component";

export class PlaylistChromeComponent extends ComponentBase {
	constructor(playlistStore, $header) {
		super();
		this._playlist = playlistStore;
		this._$header = $header;
	}

	_onAttach() {
		this._$header.html("");
		const $title = $(`<span class="title" />`).appendTo(this._$header);
		const $stats = $(`<span class="info" />`).appendTo(this._$header);

		const updateActions$ = this._playlist.actions$
			.filter(a => a.type == "add" || a.type == "remove" || a.type == "list");

		this._playlist.state$.first()
			.merge(updateActions$)
			.compSubscribe(this, ({state}) => {
				const totalTime = state.list.reduce((time, source) => time + source.totalTime, 0);
				$title.text(`${state.list.length} item${state.list.length == 1 ? "" : "s"}`);
				$stats.text(moment.duration(totalTime, "seconds").format());
			});

		const $indicator = $(`<div class="playing-indicator" />`).appendTo(this._$mount);
		let lastSource;
		this._playlist.state$
			.compSubscribe(this, ({state, type}) => {
				const source = state.current && state.current.source;
				if (!source)
					return;

				if (source == lastSource && type != "move")
					return;

				lastSource = source;
				const index = state.list.indexOf(source);
				const percentage = state.list.length ? index / state.list.length * 100 : 0;

				$indicator.animate({
					top: `${percentage}%`
				}, 200);
			});
	}
}
