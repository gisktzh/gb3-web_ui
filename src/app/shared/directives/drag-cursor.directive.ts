import {Directive, Inject, OnDestroy, OnInit} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Subscription, tap} from 'rxjs';
import {DOCUMENT} from '@angular/common';

@Directive({
  selector: '[dragCursor]'
})
export class DragCursorDirective implements OnInit, OnDestroy {
  private readonly subscription: Subscription = new Subscription();

  constructor(@Inject(DOCUMENT) private document: Document, private cdkDrag: CdkDrag) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private initSubscriptions() {
    this.subscription.add(
      this.cdkDrag.started
        .pipe(
          tap(() => {
            this.document.body.style.cursor = 'grabbing';
          })
        )
        .subscribe()
    );

    this.subscription.add(
      this.cdkDrag.ended
        .pipe(
          tap(() => {
            this.document.body.style.cursor = 'auto';
          })
        )
        .subscribe()
    );
  }
}
