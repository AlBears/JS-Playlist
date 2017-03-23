import _ from 'lodash';

import { Validator } from '../validator';

export const YOUTUBE_REGEXES = [
	/https?:\/\/(?:www\.)?youtube\.com\/.*?v=(.*)$/,
	/https?:\/\/youtu\.be\/(.*)/
];

export function validateAddSource(url) {
	const validator = new Validator();
	if (!_.some(YOUTUBE_REGEXES, r => r.test(url)))
		validator.error(`Invalid Url`);

	return validator;
}
