import {Component, Inject, Input} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Store} from '@ngrx/store';

@Component({
  selector: 'contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss']
})
export class ContactDetailComponent {
  @Input() public contactType!: 'address' | 'email';
  @Input() public street?: string;
  @Input() public place?: string;
  @Input() public email?: string;
  @Input() public coordinates?: string;

  private readonly clipBoard?: Clipboard;

  constructor(@Inject(DOCUMENT) private readonly document: Document, private readonly store: Store) {
    // since this is unimportant, we fail silently by not assigning the Clipboard
    if (this.document.defaultView) {
      this.clipBoard = this.document.defaultView.navigator.clipboard;
    }
  }

  public async copyToClipboard(event: Event) {
    event.preventDefault();
    await this.clipBoard?.writeText(`${this.street}, ${this.place}`);
  }
}
