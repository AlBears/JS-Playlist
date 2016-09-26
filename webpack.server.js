var path = require("path");

function createConfig(isDebug){
	return {
		target: "node",
		devtool: "source-map",
		entry: "./src/server/server.js",
		output: {
			path: path.join(__dirname, "build"),
			filename: "server.js"
		},
		resolve: {
			alias: {
				shared: path.join(__dirname, "src", "shared")
			}
		},
		module: {
			loaders: [
				{ test: /\.js$/, loader: "babel", exclude: /node_modules/},
				{ test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/}
			]
		}
	};
}

module.exports = createConfig(true);
module.exports.create = createConfig;
