import io from 'socket.io-client';

import { ObservableSocket } from 'shared/observable-socket';

export const socket = io({ autoConnect: false });
export const server = new ObservableSocket(socket);

//create playlist store
//create user store
//create chat store
