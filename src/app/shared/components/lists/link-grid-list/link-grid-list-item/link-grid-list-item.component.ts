import {Component, Input} from '@angular/core';
import {MainPage} from '../../../../enums/main-page.enum';
import {RouterLink} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';

/**
 * Can be used for internal and external links; if "internalLink" is set, "url" is ignored and a RouterLink is used.
 *
 * "imageUrl" is used as a hero image; it is only applicable if size is "large".
 *
 * If size is "small", a row contains up to 3 elements; if size is "large", a row contains up to 2 elements.
 *
 * EntryType and EntryDate are optional and displayed as smaller introductory text above the title; entryType is displayed in bold.
 *
 */
@Component({
  selector: 'link-grid-list-item',
  templateUrl: './link-grid-list-item.component.html',
  styleUrls: ['./link-grid-list-item.component.scss'],
  imports: [RouterLink, NgTemplateOutlet],
})
export class LinkGridListItemComponent {
  @Input() public title!: string;
  @Input() public url!: string;
  @Input() public internalLink?: MainPage;
  @Input() public internalQueryParams?: Record<string, string>;
  @Input() public entryType?: string;
  @Input() public entryDate?: string;
  @Input() public size: 'small' | 'large' = 'small';
  @Input() public imageUrl?: string;
}
