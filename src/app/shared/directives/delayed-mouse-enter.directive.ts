import {Directive, EventEmitter, HostListener, Input, OnDestroy, Output} from '@angular/core';
import {Subject, Subscription, takeUntil, timer} from 'rxjs';

/**
 * Fires a delayed mouseenter event by the specified amount of miliseconds. If mouseleave occurs before the delay is finished, no event will
 * be fired.
 */
@Directive({
  selector: '[delayedMouseEnter]',
  standalone: true
})
export class DelayedMouseEnterDirective implements OnDestroy {
  /**
   * Defines the duration of the delay in miliseconds, defaults to 1000ms
   */
  @Input() public delayDurationInMs: number = 1000;
  @Output() public readonly delayedMouseEnter = new EventEmitter<unknown>();
  private readonly unsubscribe$ = new Subject<void>();
  private subscription: Subscription|undefined;

  @HostListener('mouseenter')
  public onMouseEnter() {
    this.subscription = timer(this.delayDurationInMs)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.delayedMouseEnter.emit();
      });
  }

  @HostListener('mouseleave')
  public onMouseLeave() {
    this.handleUnsubscribe();
  }

  public ngOnDestroy() {
    this.handleUnsubscribe();
  }

  private handleUnsubscribe() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
