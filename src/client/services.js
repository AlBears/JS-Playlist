import io from 'socket.io-client';

import { ObservableSocket } from 'shared/observable-socket';
import { UsersStore } from './stores/users';
import { ChatStore } from './stores/chat';
import { PlaylistStore } from './stores/playlist';

export const socket = io({ autoConnect: false });
export const server = new ObservableSocket(socket);

export const usersStore = new UsersStore(server);
export const chatStore = new ChatStore(server, usersStore);
export const playlistStore = new PlaylistStore(server);
