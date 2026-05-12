import {Component, inject, input} from '@angular/core';
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

  public contactType = input.required<'address' | 'email' | 'link'>();
  public street = input<string>();
  public place = input<string>();
  public email = input<string>();
  public coordinates = input<string>();
  public url = input<string>();
  public title = input<string>();

  public copyToClipboard(event: Event) {
    event.preventDefault();
    this.clipboard.copy(`${this.street()}, ${this.place()}`);
  }
}
