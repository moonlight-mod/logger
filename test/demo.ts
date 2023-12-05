import { Colors, Format, RESET_FORMAT } from "../src/Format";
import { Logger } from "../src/Logger";

const log = new Logger();
log.setLevel(0);

log.info("So many log levels");
log.debug("meow");
log.verbose("woof");
log.info("hello!");
log.warn("hai");
log.error(":3");

// Prints stack traces
log.raw("");
log.error("Stacktrace printing:");
log.error(new Error());

// And inspects objects
log.raw("");
log.info("Object inspection:");
log.info({
  hello: "Hi",
  NaN: true,
  1: 1
});

log.raw("");
log.info(
  new Format({
    foreground: Colors.Magenta
  }),
  "Fancy formatting",
  RESET_FORMAT,
  { computer: true },
  "Combined with other features"
);

log.raw("");
log.setPrefix([
  new Format({
    foreground: Colors.Magenta
  }),
  "[wpTools]"
]);

log.info("Set permanent prefix");
log.raw("");
log.raw("log raw");
