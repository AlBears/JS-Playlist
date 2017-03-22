import $ from 'jquery';
import 'moment-duration-format';

import 'shared/operators';

import "./application.scss";

import * as services from "./services";


//------------------------
// Playground
services.server
	.emitAction$("login", {username: "foo", password: "bar"})
	.subscribe(user => {
		console.log("We're logged in: " + user);
	}, error => {
		console.error(error);
	});
//------------------------
// Auth
const $html = $("html");
services.usersStore.currentUser$.subscribe(user => {
	if (user.isLoggedIn) {
		$html.removeClass('not-logged-in');
		$html.addClass('logged-in');
	} else {
		$html.addClass('not-logged-in');
		$html.removeClass('logged-in');
	}
});

//------------------------
// Components
require("./components/player/player");
require("./components/users/users");
require("./components/chat/chat");
require("./components/playlist/playlist");
//------------------------
// Bootstrap
services.socket.connect();
