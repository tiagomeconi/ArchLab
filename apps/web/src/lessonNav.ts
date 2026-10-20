import { saveSession, emptyRequirements } from "./session";
import { go } from "./nav";
import type { Lesson } from "./lessons";
import { LESSONS } from "./lessons";
import { t } from "./i18n";

export const lessonById = (id: string | null | undefined) => LESSONS.find((l) => l.id === id);
export const nextLesson = (l: Lesson) => LESSONS[LESSONS.findIndex((x) => x.id === l.id) + 1];
/** Endereço do laboratório em modo aula: canvas em branco, um desenho fixo por aula (retomar de onde parou). */
export const lessonUrl = (l: Lesson) => `/app?blank=1&s=1&d=${l.designId}&l=${l.id}`;
export function openLesson(l: Lesson, hard = false) {
  saveSession({ mode: "free", title: `${t("Aula")}: ${t(l.title)}`, requirements: emptyRequirements() });
  if (hard) location.assign(lessonUrl(l)); else go(lessonUrl(l));
}
