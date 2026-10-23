import {signal} from '@angular/core';

interface ResultMarkingAdapter<Key> {
  enabled: () => boolean;
  canMark: (key: Key) => boolean;
  hasPinned: () => boolean;
  isPinned: (key: Key) => boolean;
  preview: (key: Key) => void;
  clearPreview: () => void;
  pin: (key: Key) => void;
  unpin: () => void;
}

export class ResultMarkingController<Key> {
  public readonly hoverEnabled = signal(true);
  public readonly hoveredKey = signal<Key | undefined>(undefined);

  constructor(private readonly adapter: ResultMarkingAdapter<Key>) {}

  public hoverStart(key: Key) {
    if (this.adapter.enabled() && this.hoverEnabled() && this.adapter.canMark(key) && !this.adapter.hasPinned()) {
      this.hoveredKey.set(key);
      this.adapter.preview(key);
    }
  }

  public hoverEnd() {
    this.hoveredKey.set(undefined);
    if (this.adapter.enabled() && !this.adapter.hasPinned()) {
      this.adapter.clearPreview();
    }
  }

  public pin(key: Key) {
    if (this.adapter.enabled() && this.adapter.canMark(key) && !this.adapter.isPinned(key)) {
      this.adapter.pin(key);
    }
  }

  public toggle(key: Key) {
    if (!this.adapter.enabled() || !this.adapter.canMark(key)) {
      return;
    }
    if (this.adapter.isPinned(key)) {
      this.hoveredKey.set(undefined);
      this.adapter.unpin();
    } else {
      this.pin(key);
    }
  }

  public toggleWithKeyboard(event: KeyboardEvent, key: Key) {
    event.preventDefault();
    this.toggle(key);
  }

  public startResize() {
    this.hoverEnabled.set(false);
    if (this.hoveredKey() !== undefined) {
      this.hoverEnd();
    }
  }

  public endResize() {
    this.hoverEnabled.set(true);
  }

  public destroy() {
    if (this.hoveredKey() !== undefined) {
      this.hoverEnd();
    }
  }
}
