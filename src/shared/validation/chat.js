import _ from 'lodash';

import { Validator } from '../validator';

export let MESSAGE_TYPES = ['normal'];

export function validateSendMessage(user, message, type) {
	const validator = new Validator();

	if (message.length > 50)
		validator.error('Message must be smaller than 50 characters');

	if (message.trim().length === 0)
		validator.error('Message cannot be empty');

	if (!_.includes(MESSAGE_TYPES, type))
		validator.error(`Invalid message type ${type}`);

	return validator;

}
