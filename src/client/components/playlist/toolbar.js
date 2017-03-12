import {ElementComponent} from "../../lib/component";

export class PlaylistToolbarComponent extends ElementComponent {
	constructor() {
		super('div');
		this.$element.addClass('toolbar');
	}
}
