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

  public readonly contactType = input.required<'address' | 'email' | 'link'>();
  public readonly street = input<string>();
  public readonly place = input<string>();
  public readonly email = input<string>();
  public readonly coordinates = input<string>();
  public readonly url = input<string>();
  public readonly title = input<string>();

  public copyToClipboard(event: Event) {
    event.preventDefault();
    this.clipboard.copy(`${this.street()}, ${this.place()}`);
  }
}
