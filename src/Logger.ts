import {Color, Colors, Format, RESET_FORMAT, TerminalColors} from "./Format";
// import * as util from "node:util";

enum Enviromnent {
  Browser,
  Node,
}

let environment = Enviromnent.Browser;

// Get the real console.log functions before anything can redefine them *cough discord*
let nativeLogFuncs = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

// non blocking writes to stderr
function writeStderr(content: string) {
  process.stderr.write(content);
}

let util: typeof import("node:util");
if (typeof process === "object") {
  environment = Enviromnent.Node;
  util = require("node:util");
}

type LogLevel = {
  (...args: any[]): void;
  logLevel: number;
  prefix: Array<string | Format>;
};

export class Logger {
  [s: string]: any | LogLevel;
  level: number = 3000;
  prefix: Array<string | Format> = [];

  constructor(createDefaultLevels: boolean = true) {}

  _logToNodeTerminal(args: Array<any>) {
    const strings: string[] = [];

    for (let index = 0; index < args.length; index++) {
      const value = args[index];

      if (value instanceof Format) {
        // Don't add padding to the beginning of string, or immediately before another format
        if (index === 0 || args[index + 1] instanceof Format) {
          strings.push(value.getTerminalEscape());
        } else {
          strings.push(RESET_FORMAT.getTerminalEscape());
          strings.push(" ");
          strings.push(value.getTerminalEscape());
        }
        continue;
      }

      let string: string = "";

      if (typeof value === "string") {
        string = value;
      } else if (
        typeof value === "object" &&
        value instanceof Error &&
        value.stack
      ) {
        // Write error stack traces
        string = value.stack + "";
      } else {
        string = util.inspect(value, false, 3, true);
      }

      // Add spaces if we're not at the end of the log, and not immediately preceding a format
      if (!(args[index + 1] instanceof Format) && args.length != index + 1) {
        string += " ";
      }
      strings.push(string);
    }

    strings.push(RESET_FORMAT.getTerminalEscape());
    strings.push("\n");
    writeStderr(strings.join(""));
  }

  _logToConsole(level: number, args: Array<any>) {
    let logFunction = nativeLogFuncs.log;
    if (level >= 4000) logFunction = nativeLogFuncs.warn;
    if (level >= 5000) logFunction = nativeLogFuncs.error;

    const consoleArgs: any[] = [];
    const consoleTemplate: string[] = [];
    for (let index = 0; index < args.length; index++) {
      const value = args[index];

      if (value instanceof Format) {
        // Don't add padding to the beginning of string, or immediately before another format
        if (index === 0 || args[index + 1] instanceof Format) {
          consoleArgs.push(value.getCssFormat());
          consoleTemplate.push("%c");
        } else {
          consoleArgs.push(...["", value.getCssFormat()]);
          consoleTemplate.push("%c %c");
        }
        continue;
      }

      let template = "%o";
      // Prevent logging of strings being in quotes
      if (typeof value === "string") template = "%s";

      // Add spaces if we're not at the end of the log, and not immediately preceding a format
      if (!(args[index + 1] instanceof Format) && args.length != index + 1) {
        template += " ";
      }

      consoleArgs.push(value);
      consoleTemplate.push(template);
    }

    logFunction(consoleTemplate.join(""), ...consoleArgs);
  }

  _logInternal(
    level: number,
    format: Array<Format | string>,
    args: Array<any>,
    noPrefix?: boolean
  ) {
    if (level < this.level) {
      return;
    }

    const mergedFormats = [...format, RESET_FORMAT];

    if (!noPrefix) {
      mergedFormats.push(...this.prefix);
      mergedFormats.push(RESET_FORMAT);
    }

    mergedFormats.push(...args);

    if (environment === Enviromnent.Node) {
      this._logToNodeTerminal(mergedFormats);
      return;
    }
    this._logToConsole(level, mergedFormats);
  }

  setLevel(level: number) {
    this.level = level;
  }

  setPrefix(prefix: Array<string | Format>) {
    this.prefix = prefix;
  }

  debug(...args: any[]) {
    this._logInternal(
      0,
      [
        new Format({
          foreground: Colors.White,
          background: Colors.Black,
        }),
        "debug",
      ],
      [...args]
    );
  }

  verbose(...args: any[]) {
    this._logInternal(
      1000,
      [
        new Format({
          foreground: Colors.Blue,
          background: Colors.Black,
        }),
        "info",
      ],
      [...args]
    );
  }

  info(...args: any[]) {
    this._logInternal(
      3000,
      [
        new Format({
          foreground: Colors.Green,
        }),
        "info",
      ],
      [...args]
    );
  }

  warn(...args: any[]) {
    this._logInternal(
      4000,
      [
        new Format({
          foreground: Colors.Black,
          background: Colors.Yellow,
          bold: true,
        }),
        "WARN",
      ],
      [...args]
    );
  }

  error(...args: any[]) {
    this._logInternal(
      5000,
      [
        new Format({
          foreground: Colors.Red,
          background: Colors.Black,
          bold: true,
        }),
        "ERR!",
      ],
      [...args]
    );
  }

  raw(...args: any[]) {
    this._logInternal(Infinity, args, [], true);
  }
}
