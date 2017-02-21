import "source-map-support/register";

import express from 'express';
import http from 'http';
import socketIo from 'socket.io';
import chalk from "chalk";
import { Observable } from "rxjs";

import { ObservableSocket } from 'shared/observable-socket';

const isDevelopment = process.env.NODE_ENV !== "production";

//--------------------------------
// Setup

const app = express();
const server = new http.Server(app);
const io = socketIo(server);



//--------------------------------
// Client webpack

if (process.env.USE_WEBPACK === "true") {
	var webpackMiddleware = require("webpack-dev-middleware"),
		webpackHotMiddlware = require("webpack-hot-middleware"),
		webpack = require("webpack"),
		clientConfig = require("../../webpack.client");

	const compiler = webpack(clientConfig);
	app.use(webpackMiddleware(compiler, {
		publicPath: "/build/",
		stats: {
			colors: true,
			chunks: false,
			assets: false,
			timings: false,
			modules: false,
			hash: false,
			version: false
		}
	}));

	app.use(webpackHotMiddlware(compiler));
	console.log(chalk.bgRed("Using WebPack Dev Middleware! THIS IS FOR DEV ONLY!"));
}

//--------------------------------
// Configure Express

app.set("view engine", "jade");
app.use(express.static("public"));

const useExternalStyles = !isDevelopment;
app.get("/", (req, res) => {
	res.render("index", {
		useExternalStyles
	});
});

//--------------------------------
// Modules

//--------------------------------
// Socket

io.on("connection", socket => {
  console.log(`Got connection from ${socket.request.connection.remoteAddress}`);

	const client = new ObservableSocket(socket);
	client.onAction("login", creds => {
		return Observable.of({ username: creds.username });
	});
});

//--------------------------------
// Startup
const port = process.env.PORT || 3000;
function startServer() {
  server.listen(port, () => {
    console.log(`Started http server on ${port}`);
  });
}

startServer();
