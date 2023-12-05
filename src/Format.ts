export enum TerminalColors {
  Black = 0,
  Red = 1,
  Green = 2,
  Yellow = 3,
  Blue = 4,
  Magenta = 5,
  Cyan = 6,
  White = 7,
  BrightBlack = 60,
  BrightRed = 61,
  BrightGreen = 62,
  BrightYellow = 63,
  BrightBlue = 64,
  BrightMagenta = 65,
  BrightCyan = 66,
  BrightWhite = 67,
  Reset = 9
}

enum TerminalCodes {
  Reset = 0,
  Bold = 1,
  Underline = 4,
  Blink = 5,
  Inverse = 7
}

const TERMINAL_FOREGROUND_OFFSET = 30;
const TERMINAL_BACKGROUND_OFFSET = 40;

export class Color {
  terminalColor: TerminalColors = TerminalColors.Reset;
  cssColor: string | null = null;

  constructor(
    cssColor: string | null,
    terminalColor: TerminalColors = TerminalColors.Reset
  ) {
    this.cssColor = cssColor;
    this.terminalColor = terminalColor;
  }

  getTerminalColor(background: boolean = false) {
    if (background) {
      return this.terminalColor + TERMINAL_BACKGROUND_OFFSET;
    }
    return this.terminalColor + TERMINAL_FOREGROUND_OFFSET;
  }

  getCssColor(background: boolean = false) {
    if (this.cssColor === null) return null;
    return `${background ? "background-" : ""}color: ${this.cssColor};`;
  }
}

export const Colors = {
  Black: new Color("#0c0c0c", TerminalColors.Black),
  Blue: new Color("#0037da", TerminalColors.Blue),
  Cyan: new Color("#3a96dd", TerminalColors.Cyan),
  Green: new Color("#13a10e", TerminalColors.Green),
  Magenta: new Color("#881798", TerminalColors.Magenta),
  Red: new Color("#c50f1f", TerminalColors.Red),
  Yellow: new Color("#c19c00", TerminalColors.Yellow),
  White: new Color("#cccccc", TerminalColors.White)
};

export const RESET_COLOR = new Color(null, TerminalColors.Reset);

type FormatOptions = {
  foreground?: Color | null;
  background?: Color | null;
  bold?: boolean;
  italic?: boolean;
};

export class Format {
  bold: boolean = false;
  italic: boolean = false;

  foreground: Color | null = null;
  background: Color | null = null;

  constructor(options?: FormatOptions) {
    if (options?.foreground) this.foreground = options.foreground;
    if (options?.background) this.background = options.background;
    if (options?.bold) this.bold = options.bold;
    if (options?.italic) this.italic = options.italic;
  }

  setBackground(color: Color) {
    this.background = color;
  }

  setForeground(color: Color) {
    this.background = color;
  }

  setBold(bold: boolean) {
    this.bold = bold;
  }

  getTerminalEscape() {
    const modifiers: Array<number | string> = [0];

    if (this.foreground)
      modifiers.push(this.foreground.getTerminalColor(false));
    if (this.background) modifiers.push(this.background.getTerminalColor(true));
    if (this.bold) modifiers.push(TerminalCodes.Bold);

    return "\x1b[" + modifiers.join(";") + "m";
  }

  getCssFormat() {
    let format = "";

    if (this.foreground) format += this.foreground.getCssColor(false);
    if (this.background) format += this.background.getCssColor(true);

    if (this.bold) format += "font-weight: 700;";
    return format;
  }
}

export const RESET_FORMAT = new Format();
