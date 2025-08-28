import {Component, Input, inject} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
import {MatIcon} from '@angular/material/icon';
import {NgTemplateOutlet} from '@angular/common';

@Component({
  selector: 'contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss'],
  imports: [MatIcon, NgTemplateOutlet],
})
export class ContactDetailComponent {
  private readonly clipboard = inject(Clipboard);

  @Input() public contactType!: 'address' | 'email' | 'link';
  @Input() public street?: string;
  @Input() public place?: string;
  @Input() public email?: string;
  @Input() public coordinates?: string;
  @Input() public url?: string;
  @Input() public title?: string;

  public copyToClipboard(event: Event) {
    event.preventDefault();
    this.clipboard.copy(`${this.street}, ${this.place}`);
  }
}
