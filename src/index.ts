import { StateSchema, Machine, Interpreter, interpret } from 'xstate';

interface RteMachineSchema extends StateSchema {
  states: {
    blurred: {};
    selected: {
      states: {
        idle: {};
        active: {};
        selecting: {};
        writing: {};
      };
    };
  };
}

type RteMachineEvent =
  | { type: 'BLUR' }
  | { type: 'SELECTION_CHANGE' }
  | { type: 'SELECTION_STARTED' };

type RteMachine = Interpreter<undefined, RteMachineSchema, RteMachineEvent>;

type RteMachineConfig = {
  DEBOUNCE_THRESHOLD: number;
  onBlur: () => void;
  onSelectionStarted: () => void;
  onSelectionChange: () => void;
  onWritingStarted: () => void;
  onWritingEnded: () => void;
};

export function createRteMachine({
  DEBOUNCE_THRESHOLD,
  onBlur,
  onSelectionStarted,
  onSelectionChange,
}: RteMachineConfig): RteMachine {
  const machine = Machine<undefined, RteMachineSchema, RteMachineEvent>(
    {
      id: 'rte',
      initial: 'blurred',
      states: {
        blurred: {
          on: {
            SELECTION_STARTED: {
              target: 'selected.active',
            },
            SELECTION_CHANGE: {
              actions: ['notifySelectionChange'],
              target: 'selected.idle',
            },
          },
        },
        selected: {
          initial: 'idle',
          states: {
            idle: {
              on: {
                BLUR: {
                  actions: ['notifyBlur'],
                  target: '#rte.blurred'
                },
                SELECTION_STARTED: {
                  target: 'active',
                },
                SELECTION_CHANGE: {
                  target: 'selecting',
                },
              },
            },
            active: {
              after: {
                [DEBOUNCE_THRESHOLD]: {
                  actions: ['notifySelectionStarted'],
                },
              },
              on: {
                SELECTION_CHANGE: {
                  target: 'idle',
                },
              },
            },
            selecting: {
              after: {
                [DEBOUNCE_THRESHOLD]: {
                  actions: ['notifySelectionChange'],
                  target: 'idle',
                },
              },
              on: {
                SELECTION_CHANGE: {
                  target: 'selecting',
                },
              },
            },
            writing: {
              after: {
                [DEBOUNCE_THRESHOLD]: 'idle',
              },
            },
          },
        },
      },
    },
    {
      actions: {
        notifyBlur: onBlur,
        notifySelectionStarted: onSelectionStarted,
        notifySelectionChange: onSelectionChange,
      },
    }
  );

  const interpreter = interpret(machine).start();

  return interpreter;
}
