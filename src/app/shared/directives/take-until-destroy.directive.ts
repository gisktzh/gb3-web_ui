import {Directive, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';

@Directive()
export class TakeUntilDestroy implements OnDestroy {
  protected unsubscribed$: Subject<void> = new Subject<void>();

  public ngOnDestroy() {
    this.unsubscribe();
  }

  protected unsubscribe() {
    if (!this.unsubscribed$.closed) {
      this.unsubscribed$.next();
      this.unsubscribed$.complete();
    }
  }
}
