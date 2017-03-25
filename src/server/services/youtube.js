import { Observable } from 'rxjs';
import moment from 'moment';
import _ from 'lodash';

import { getJson$ } from '../lib/request';
import { YOUTUBE_REGEXES } from 'shared/validation/playlist';
import { fail } from 'shared/observable-socket';

const YOUTUBE_ENDPOINT = "https://www.googleapis.com/youtube/v3";

export class YoutubeService {
	constructor(apiKey) {
		this._apiKey = apiKey;
	}

	process$(url) {
		const match = _(YOUTUBE_REGEXES)
			.map(r => url.match(r))
			.find(a => a != null);

		return match ? this.getSourceFromId$(match[1]) : null;
	}

	getSourceFromId$(id) {
		return getJson$(this._buildGetVideoUrl(id))
			.flatMap(data => {
				if (!data || data.items.length != 1)
					return fail(`Cannot locate youtube video ${id}`);

				const { id, snippet, contentDetails } = data.items[0];
				return Observable.of({
					type: "youtube",
					thumb: snippet.thumbnails.default.url,
					url: id,
					title: snippet.title || "{No Title}",
					totalTime: moment.duration(contentDetails.duration).asSeconds()
				});
			});
	}

	_buildGetVideoUrl(id) {
		return `${YOUTUBE_ENDPOINT}/videos?id=${id}&key=${this._apiKey}&part=snippet,contentDetails,statistics,status`;
	}
}
