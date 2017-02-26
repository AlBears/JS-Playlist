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

//------------------------
// Components
require("./components/player/player");

//------------------------
// Bootstrap
services.socket.connect();
