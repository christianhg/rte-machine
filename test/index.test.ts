import { createRteMachine } from '../src';

const DEBOUNCE_THRESHOLD = 250;
const onBlur = jest.fn();
const onSelectionChange = jest.fn();
const onSelectionStarted = jest.fn();

const rteMachine = createRteMachine({
  DEBOUNCE_THRESHOLD,
  onSelectionChange,
  onSelectionStarted,
  onWritingEnded: () => {},
  onWritingStarted: () => {},
  onBlur,
});

jest.useFakeTimers();

describe('rteMachine', () => {
  it('notifies of the initial selection change', () => {
    rteMachine.send({ type: 'SELECTION_CHANGE' });

    expect(onSelectionChange).toBeCalled();
  });

  it('notifies of getting blurred again', () => {
    rteMachine.send({ type: 'BLUR' });

    expect(onBlur).toBeCalled();
  });

  it('it notifies of a selection start after the debounce threshold', () => {
    rteMachine.send({ type: 'SELECTION_STARTED' });

    expect(onSelectionStarted).not.toBeCalled();

    jest.runAllTimers();

    expect(onSelectionStarted).toBeCalled();
  });

  it('notifies of a selection change after ended selection', () => {
    rteMachine.send({ type: 'SELECTION_CHANGE' });

    expect(onSelectionChange).toBeCalled();
  });

  it('notifies of getting blurred again', () => {
    rteMachine.send({ type: 'BLUR' });

    expect(onBlur).toBeCalled();
  });
});
