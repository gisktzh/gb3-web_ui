import {Component, Input} from '@angular/core';
import {LinkableElement} from '../../../../shared/interfaces/linkable-element.interface';

@Component({
  selector: 'ktzh-link-list-item',
  templateUrl: './ktzh-link-list-item.component.html',
  styleUrls: ['./ktzh-link-list-item.component.scss']
})
export class KtzhLinkListItemComponent {
  @Input() public links: LinkableElement[] = [];
}
