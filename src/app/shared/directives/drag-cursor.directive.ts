import {Directive, OnDestroy, OnInit, DOCUMENT, inject} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Subscription, tap} from 'rxjs';

@Directive({
  selector: '[dragCursor]',
  standalone: false,
})
export class DragCursorDirective implements OnInit, OnDestroy {
  private readonly document = inject<Document>(DOCUMENT);
  private readonly cdkDrag = inject(CdkDrag);

  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(
      this.cdkDrag.started
        .pipe(
          tap(() => {
            this.document.body.style.cursor = 'grabbing';
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.cdkDrag.ended
        .pipe(
          tap(() => {
            this.document.body.style.cursor = 'auto';
          }),
        )
        .subscribe(),
    );
  }
}
