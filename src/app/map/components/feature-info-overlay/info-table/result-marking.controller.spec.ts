import {ResultMarkingController} from './result-marking.controller';

describe('ResultMarkingController', () => {
  let marking: ResultMarkingController<string>;
  let pinned: string | undefined;
  let enabled: boolean;
  const preview = vi.fn();
  const clearPreview = vi.fn();
  const pin = vi.fn((key: string) => (pinned = key));
  const unpin = vi.fn(() => (pinned = undefined));

  beforeEach(() => {
    enabled = true;
    pinned = undefined;
    marking = new ResultMarkingController({
      enabled: () => enabled,
      canMark: (key) => key !== 'no-geometry',
      hasPinned: () => pinned !== undefined,
      isPinned: (key) => pinned === key,
      preview,
      clearPreview,
      pin,
      unpin,
    });
  });

  it('previews and clears an unpinned result', () => {
    marking.hoverStart('result');
    expect(preview).toHaveBeenCalledWith('result');
    expect(marking.hoveredKey()).toBe('result');
    marking.hoverEnd();
    expect(clearPreview).toHaveBeenCalledOnce();
    expect(marking.hoveredKey()).toBeUndefined();
  });

  it('pins a preview, protects it from other hovering, and unpins on repeated activation', () => {
    marking.hoverStart('result');
    marking.toggle('result');
    marking.hoverStart('other');
    marking.hoverEnd();
    expect(preview).toHaveBeenCalledOnce();
    expect(clearPreview).not.toHaveBeenCalled();
    marking.toggle('result');
    expect(unpin).toHaveBeenCalledOnce();
    expect(marking.hoveredKey()).toBeUndefined();
  });

  it('can replace another pin through explicit activation', () => {
    pinned = 'other';
    marking.toggle('result');
    expect(pinned).toBe('result');
  });

  it('clears previews and suppresses hovering during resizing', () => {
    marking.hoverStart('result');
    marking.startResize();
    marking.hoverStart('other');
    expect(preview).toHaveBeenCalledOnce();
    expect(clearPreview).toHaveBeenCalledOnce();
    marking.endResize();
    marking.hoverStart('other');
    expect(preview).toHaveBeenCalledTimes(2);
  });

  it('never clears a pin when resizing or destroying', () => {
    marking.hoverStart('result');
    marking.pin('result');
    marking.startResize();
    marking.destroy();
    expect(clearPreview).not.toHaveBeenCalled();
    expect(unpin).not.toHaveBeenCalled();
  });

  it('prevents native Space behaviour so a checked preview can still be pinned', () => {
    marking.hoverStart('result');
    const event = new KeyboardEvent('keydown', {key: ' ', cancelable: true});
    marking.toggleWithKeyboard(event, 'result');
    expect(event.defaultPrevented).toBe(true);
    expect(pinned).toBe('result');
  });

  it('clears only an owned preview on destruction', () => {
    marking.destroy();
    expect(clearPreview).not.toHaveBeenCalled();
    marking.hoverStart('result');
    marking.destroy();
    expect(clearPreview).toHaveBeenCalledOnce();
  });

  it('does not mark missing geometries or read-only results', () => {
    marking.hoverStart('no-geometry');
    marking.toggle('no-geometry');
    enabled = false;
    marking.hoverStart('result');
    marking.toggle('result');
    marking.hoverEnd();
    expect(preview).not.toHaveBeenCalled();
    expect(pin).not.toHaveBeenCalled();
    expect(clearPreview).not.toHaveBeenCalled();
  });
});
