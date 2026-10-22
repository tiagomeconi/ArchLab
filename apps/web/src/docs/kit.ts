/** Peças para escrever artigos da documentação (ver ../docs.ts para o formato e a explicação do bilinguismo). */
import type { Bi, DocBlock, FigEdge, FigKind, FigNode } from "../docs";
export type { Bi, DocBlock, DocArticle, FigEdge, FigNode, FigKind } from "../docs";
export const h = (x: Bi): DocBlock => ({ k: "h", x });
export const p = (x: Bi): DocBlock => ({ k: "p", x });
export const ul = (...x: Bi[]): DocBlock => ({ k: "ul", x });
export const tip = (x: Bi): DocBlock => ({ k: "tip", x });
export const code = (x: string): DocBlock => ({ k: "code", x });
/** Tabela comparativa: cabeçalho e linhas, cada célula um par [pt, en]. */
export const table = (head: Bi[], ...rows: Bi[][]): DocBlock => ({ k: "table", head, rows });
/** Nó de diagrama. */
export const node = (id: string, label: Bi | string, kind?: FigKind): FigNode => ({ id, label, kind });
/** Seta de diagrama (`from` → `to`). */
export const edge = (from: string, to: string, label?: Bi | string, opts: { dashed?: boolean; both?: boolean } = {}): FigEdge => ({ from, to, label, ...opts });
/** Diagrama desenhado na página: `cols` são colunas de nós, da esquerda para a direita. */
export const fig = (cap: Bi, cols: FigNode[][], edges: FigEdge[]): DocBlock => ({ k: "fig", cap, cols, edges });
