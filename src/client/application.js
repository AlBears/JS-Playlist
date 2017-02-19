import "./application.scss";

import * as services from "./services";


//------------------------
// Playground
services.server.on$("test")
	.map(d => d + " whoa")
	.subscribe(item => {
		console.log(`Got ${item} from server!`);
	});

//------------------------
// Auth

//------------------------
// Components

//------------------------
// Bootstrap
services.socket.connect();
