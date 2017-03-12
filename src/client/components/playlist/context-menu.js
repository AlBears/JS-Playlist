import { ElementComponent } from "../../lib/component";

export class PlaylistContextMenuComponent extends ElementComponent {
	constructor() {
		super('div');
		this.$element.addClass('context-menu');
	}
}
