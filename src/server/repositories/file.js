import fs from 'fs';
import { Observable } from 'rxjs';

const readFile = Observable.bindNodeCallback(fs.readFile);
const writeFile = Observable.bindNodeCallback(fs.writeFile);

export class FileRepository {
	constructor(filename) {
		this._filename = filename;
	}

	getAll$() {
		return readFile(this._filename)
			.map(contents => JSON.parse(contents))
			.do(() => {
				console.log(`${this._filename}: got all data`);
			})
			.catch(e => {
				console.error(`${this._filename}: failed to get data: ${e.stack || e}`);
				return Observable.throw(e);
			});
	}

	save$(items) {
		return writeFile(this._filename, JSON.stringify(items))
			.do(() => {
				console.log(`${this._filename}: data saved`);
			})
			.catch(e => {
				console.error(`${this._filename}: failed to save data: ${e.stack || e}`);
			});
	}
}
