import { Observable } from 'rxjs';

export class YoutubeService {
	process$(url) {
		return Observable.of({
			title: `SUPER - ${url}`,
			type: 'youtube',
			url,
			totalTime: 500
		}).delay(400);
	}
}
