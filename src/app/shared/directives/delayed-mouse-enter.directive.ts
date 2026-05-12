import {Directive, input, output, OnDestroy} from '@angular/core';

/**
 * Fires a delayed mouseenter event. If mouseleave happens before the delay,
 * the event is cancelled.
 */
@Directive({
  selector: '[delayedMouseEnter]',
  standalone: true,
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class DelayedMouseEnterDirective implements OnDestroy {
  // signal-style input/output APIs
  public readonly delayDurationInMs = input<number>(1000);
  public readonly delayedMouseEnter = output<void>();

  private timeoutId?: number;

  public onMouseEnter(): void {
    this.clearTimeout();

    this.timeoutId = window.setTimeout(() => {
      this.delayedMouseEnter.emit();
    }, this.delayDurationInMs());
  }

  public onMouseLeave(): void {
    this.clearTimeout();
  }

  public ngOnDestroy(): void {
    this.clearTimeout();
  }

  private clearTimeout(): void {
    if (this.timeoutId !== undefined) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }
}
