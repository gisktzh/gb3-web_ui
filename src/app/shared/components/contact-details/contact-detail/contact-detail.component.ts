import {Component, Input} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'contact-detail',
  templateUrl: './contact-detail.component.html',
  styleUrls: ['./contact-detail.component.scss'],
  standalone: false,
})
export class ContactDetailComponent {
  @Input() public contactType!: 'address' | 'email';
  @Input() public street?: string;
  @Input() public place?: string;
  @Input() public email?: string;
  @Input() public coordinates?: string;

  constructor(private readonly clipboard: Clipboard) {}

  public copyToClipboard(event: Event) {
    event.preventDefault();
    this.clipboard.copy(`${this.street}, ${this.place}`);
  }
}
