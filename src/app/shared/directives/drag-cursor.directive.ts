import {Directive, DOCUMENT, DestroyRef, inject} from '@angular/core';
import {CdkDrag} from '@angular/cdk/drag-drop';

@Directive({
  selector: '[dragCursor]',
})
export class DragCursorDirective {
  private readonly document = inject<Document>(DOCUMENT);
  private readonly cdkDrag = inject(CdkDrag);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const dragStartedSub = this.cdkDrag.started.subscribe(() => {
      this.document.body.style.setProperty('cursor', 'grabbing');
    });

    const dragEndedSub = this.cdkDrag.ended.subscribe(() => {
      this.document.body.style.setProperty('cursor', 'auto');
    });

    this.destroyRef.onDestroy(() => {
      dragStartedSub.unsubscribe();
      dragEndedSub.unsubscribe();
    });
  }
}
