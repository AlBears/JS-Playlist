import "./application.scss";

import * as services from "./services";


//------------------------
// Playground
services.server.emitAction$("login", { username: "foo", password: "bar" })
		.subscribe(result => {
			if (result.error)
				console.error(result.error);
			else
					console.log('We are logged in');

		});
//------------------------
// Auth

//------------------------
// Components

//------------------------
// Bootstrap
services.socket.connect();
