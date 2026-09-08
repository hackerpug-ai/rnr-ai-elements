/**
 * Interactive prop controls for matrix screens — real component props the
 * visitor flips and watches re-render the cells. Only items with genuinely
 * meaningful live props carry controls; a control that changes nothing is
 * decoration and stays out.
 */
export type ControlOption = { label: string; value: string | number | boolean };
export type ControlSpec = {
  /** The override key the cell reads — named after the prop it feeds. */
  prop: string;
  label: string;
  options: ControlOption[];
};

export const CONTROLS: Record<string, ControlSpec[]> = {
  message: [
    {
      prop: 'from',
      label: 'from',
      options: [
        { label: 'assistant', value: 'assistant' },
        { label: 'user', value: 'user' },
      ],
    },
  ],
  'prompt-input': [
    {
      prop: 'status',
      label: 'status',
      options: [
        { label: 'ready', value: 'ready' },
        { label: 'submitted', value: 'submitted' },
        { label: 'streaming', value: 'streaming' },
        { label: 'error', value: 'error' },
      ],
    },
  ],
  reasoning: [
    {
      prop: 'defaultOpen',
      label: 'defaultOpen',
      options: [
        { label: 'false', value: false },
        { label: 'true', value: true },
      ],
    },
    {
      prop: 'isStreaming',
      label: 'isStreaming',
      options: [
        { label: 'false', value: false },
        { label: 'true', value: true },
      ],
    },
  ],
  task: [
    {
      prop: 'status',
      label: 'first row status',
      options: [
        { label: 'pending', value: 'pending' },
        { label: 'running', value: 'running' },
        { label: 'completed', value: 'completed' },
        { label: 'failed', value: 'failed' },
      ],
    },
  ],
  tool: [
    {
      prop: 'state',
      label: 'tool state',
      options: [
        { label: 'input-streaming', value: 'input-streaming' },
        { label: 'input-available', value: 'input-available' },
        { label: 'output-available', value: 'output-available' },
        { label: 'output-error', value: 'output-error' },
      ],
    },
  ],
};
