const fs = require("fs");
class Logger {
    static logFilePath = "log.txt";
    static debug = false;

    static info(log) {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] - ${log}\n`;
        console.log(message);
        if (this.debug) {
            fs.appendFileSync(this.logFilePath, message);
        };
    }

    static warn(warn) {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] - ${warn}\n`;
        console.log(message);
        if (this.debug) {
            fs.appendFileSync(this.logFilePath, message);
        };
    }

    static error(error) {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] - ${error}\n`;
        fs.appendFileSync(this.logFilePath, message);
    }
}
module.exports = Logger;
