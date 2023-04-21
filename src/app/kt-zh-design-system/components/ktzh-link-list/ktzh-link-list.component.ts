import {Component, Input} from '@angular/core';
import {LinkableElement} from '../../../shared/interfaces/linkable-element.interface';

@Component({
  selector: 'ktzh-link-list',
  templateUrl: './ktzh-link-list.component.html',
  styleUrls: ['./ktzh-link-list.component.scss']
})
export class KtzhLinkListComponent {
  @Input() public links: LinkableElement[] = [];
}
