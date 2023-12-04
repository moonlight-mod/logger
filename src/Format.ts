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
  Reset = 9,
}

enum TerminalCodes {
  Reset = 0,
  Bold = 1,
  Underline = 4,
  Blink = 5,
  Inverse = 7,
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
        return this.terminalColor + TERMINAL_BACKGROUND_OFFSET
    }
    return this.terminalColor + TERMINAL_FOREGROUND_OFFSET;
  }

  getCssColor(background: boolean = false) {
    if (this.cssColor == null) return null;
    return `${background ? "background-" : ""}color: ${this.cssColor};`;
  }
}

const RESET_COLOR = new Color(null, TerminalColors.Reset);

type FormatOptions = {
  foregroundColor?: Color | null;
  backgroundColor?: Color | null;
  bold?: boolean;
  italic?: boolean;
};

export class Format {
  bold: boolean = false;
  italic: boolean = false;

  foregroundColor: Color | null = null;
  backgroundColor: Color | null = null;

  constructor(options?: FormatOptions) {
    if (options?.foregroundColor)
      this.foregroundColor = options.foregroundColor;
    if (options?.backgroundColor)
      this.backgroundColor = options.backgroundColor;
    if (options?.bold) this.bold = options.bold;
    if (options?.italic) this.italic = options.italic;
  }

  setBackground(color: Color) {
    this.backgroundColor = color;
  }

  setForeground(color: Color) {
    this.backgroundColor = color;
  }

  setBold(bold: boolean) {
    this.bold = bold;
  }

  getTerminalEscape() {
    let modifiers: Array<number | string> = [0];

    if (this.foregroundColor) modifiers.push(this.foregroundColor.getTerminalColor(false));
    if (this.backgroundColor) modifiers.push(this.backgroundColor.getTerminalColor(true));
    if (this.bold) modifiers.push(TerminalCodes.Bold);

    return "\x1b[" + modifiers.join(";") + "m";
  }

  getCssFormat() {
    let format = "";

    if (this.foregroundColor) format += this.foregroundColor.getCssColor(false);
    if (this.backgroundColor) format += this.backgroundColor.getCssColor(true);

    if (this.bold) format += "font-weight: 700;";
    return format
  }
}

export const RESET_FORMAT = new Format();
