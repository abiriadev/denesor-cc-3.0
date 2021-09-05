"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logbox = void 0;
class Logbox {
    constructor(init) {
        this.data = init || [];
    }
    push(data) {
        this.data.push(data);
        return this;
    }
    log(message, type) {
        return this.push({
            message,
            type,
            date: new Date(),
        });
    }
    toArray() {
        return this.data;
    }
    filter(types) {
        return new Logbox(this.data.filter((d) => types.includes(d.type)));
    }
    toString() {
        return this.data
            .map((data) => `[${data.date.toUTCString()}] ${data.type}: ${data.message}`)
            .join('\n');
    }
}
exports.Logbox = Logbox;
