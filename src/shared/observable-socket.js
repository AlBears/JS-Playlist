import { Observable, ReplaySubject } from "rxjs";

export class ObservableSocket {
	get isConnected() { return this._state.isConnected; }
	get isReconnecting() { return this._state.isReconnecting; }
	get isTotallyDead() { return !this.isConnected && !this.isReconnecting; }

	constructor(socket) {
		this._socket = socket;
		this._state = {};
		this._actionCallbacks = {};
		this._requests = {};
		this._nextRequestId = 0;

		this.status$ = Observable.merge(
			this.on$("connect").map(() => ({ isConnected: true })),
			this.on$("disconnect").map(() => ({ isConnected: false })),
			this.on$("reconnecting").map(attempt => ({ isConnected: false, isReconnecting: true, attempt })),
			this.on$("reconnect_failed").map(() => ({ isConnected: false, isReconnecting: false })))
			.publishReplay(1)
			.refCount();

		this.status$.subscribe(state => this._state = state);

	}

	//----------------
	// Basic wrappers
	on$(event) {
		return Observable.fromEvent(this._socket, event);
	}

	on(event, callback) {
		this._socket.on(event, callback);
	}

	off(event, callback) {
		this._socket.off(event, callback);
	}

	emit(event, arg) {
		this._socket.emit(event, arg);
	}
	//----------------
	// Emit (Client side)
	emitAction$(action, arg) {
		const id = this._nextRequestId++;
		this._registerCallbacks(action);

		const subject = this._requests[id] = new ReplaySubject(1);
		this._socket.emit(action, arg, id);
		return subject;
	}

	_registerCallbacks(action) {
		if (this._actionCallbacks.hasOwnProperty(action))
			return;

		this._socket.on(action, (arg, id) => {
			const request = this._popRequests(id);
			if (!request)
				return;

			request.next(arg);
			request.complete();
		});

		this._socket.on(`${action}:fail`, (arg, id) => {
			const request = this._popRequests(id);
			if (!request)
				return;

			request.error(arg);
		});

		this._actionCallbacks[action] = true;
	}

	_popRequests(id) {
		if (!this._requests.hasOwnProperty(id)) {
			console.error(`Event with id ${id} was returned twice, or the server did not send back ID`);
			return;
		}

		const request = this._requests[id];
		delete this._requests[id];
		return request;
	}

	//----------------
	// On (server side)
	onAction(action) {
		this._socket.on(action, (...args) => {
			console.log(args);
		});
	}









}
