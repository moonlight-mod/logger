import { Colors, Format, RESET_FORMAT } from "./Format";

enum Enviromnent {
  Browser,
  Node
}

let environment = Enviromnent.Browser;

// Get the real console.log functions before anything can redefine them *cough discord*
const nativeLogFuncs = {
  log: console.log,
  warn: console.warn,
  error: console.error
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

export class Logger {
  level: number = 3000;
  prefix: Array<string | Format> = [];

  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logToNodeTerminal(args: any[]) {
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
      if (!(args[index + 1] instanceof Format) && args.length !== index + 1) {
        string += " ";
      }
      strings.push(string);
    }

    strings.push(RESET_FORMAT.getTerminalEscape());
    strings.push("\n");
    writeStderr(strings.join(""));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private logToConsole(level: number, args: any[]) {
    let logFunction = nativeLogFuncs.log;
    if (level >= 4000) logFunction = nativeLogFuncs.warn;
    if (level >= 5000) logFunction = nativeLogFuncs.error;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      if (!(args[index + 1] instanceof Format) && args.length !== index + 1) {
        template += " ";
      }

      consoleArgs.push(value);
      consoleTemplate.push(template);
    }

    logFunction(consoleTemplate.join(""), ...consoleArgs);
  }

  private logInternal(
    level: number,
    format: Array<Format | string>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    args: any[],
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
      this.logToNodeTerminal(mergedFormats);
      return;
    }
    this.logToConsole(level, mergedFormats);
  }

  setLevel(level: number) {
    this.level = level;
  }

  setPrefix(prefix: Array<string | Format>) {
    this.prefix = prefix;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug(...args: any[]) {
    this.logInternal(
      0,
      [
        new Format({
          foreground: Colors.White,
          background: Colors.Black
        }),
        "debug"
      ],
      [...args]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  verbose(...args: any[]) {
    this.logInternal(
      1000,
      [
        new Format({
          foreground: Colors.Blue,
          background: Colors.Black
        }),
        "info"
      ],
      [...args]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(...args: any[]) {
    this.logInternal(
      3000,
      [
        new Format({
          foreground: Colors.Green
        }),
        "info"
      ],
      [...args]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(...args: any[]) {
    this.logInternal(
      4000,
      [
        new Format({
          foreground: Colors.Black,
          background: Colors.Yellow,
          bold: true
        }),
        "WARN"
      ],
      [...args]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(...args: any[]) {
    this.logInternal(
      5000,
      [
        new Format({
          foreground: Colors.Red,
          background: Colors.Black,
          bold: true
        }),
        "ERR!"
      ],
      [...args]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw(...args: any[]) {
    this.logInternal(Infinity, args, [], true);
  }
}
