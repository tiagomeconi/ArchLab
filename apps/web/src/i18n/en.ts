import { start } from "./en.start";
import { cases } from "./en.cases";
import { lab } from "./en.lab";
import { extra } from "./en.extra";
import { landing } from "./en.landing";
import { rating } from "./en.rating";
import { components } from "./en.components";
import { newcases } from "./en.newcases";

export const EN: Record<string, string> = { ...newcases, ...components, ...rating, ...landing, ...cases, ...lab, ...extra, ...start };
