/**
 * The matrix-cell registry. Each entry maps an item name to its four seeded
 * cells (populated / empty / loading / error). Cells are authored in batch
 * files by surface (ai-chat, ai-agent, ai-code, ui) so parallel authoring
 * never touches a shared file; this module is the single merge point.
 *
 * A cell receives the matrix screen's control overrides and must apply them
 * to the component it renders — controls are real props, not decoration.
 */
import type { ReactElement } from 'react';

import { AI_CHAT_CELLS } from './cells/ai-chat';
import { AI_AGENT_CELLS } from './cells/ai-agent';
import { AI_CODE_CELLS } from './cells/ai-code';
import { UI_CELLS } from './cells/ui';
import { LIB_CELLS } from './cells/lib';

export type CellState = 'populated' | 'empty' | 'loading' | 'error';
export type CellOverrides = Record<string, unknown>;
export type CellFn = (overrides: CellOverrides) => ReactElement;
export type ItemCells = Partial<Record<CellState, CellFn>>;

export const CELLS: Record<string, ItemCells> = {
  ...AI_CHAT_CELLS,
  ...AI_AGENT_CELLS,
  ...AI_CODE_CELLS,
  ...UI_CELLS,
  ...LIB_CELLS,
};

export const CELL_STATES: CellState[] = ['populated', 'empty', 'loading', 'error'];
