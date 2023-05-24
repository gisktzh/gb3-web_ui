import {Component, Inject} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Store} from '@ngrx/store';

@Component({
  selector: 'contact-details',
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.scss']
})
export class ContactDetailsComponent {
  private readonly clipBoard?: Clipboard;

  constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly store: Store) {
    // since this is unimportant, we fail silently by not assigning the Clipboard
    if (this.document.defaultView) {
      this.clipBoard = this.document.defaultView.navigator.clipboard;
    }
  }

  public async copyToClipboard(event: Event, value: string) {
    event.preventDefault();
    await this.clipBoard?.writeText(value);
  }
}
