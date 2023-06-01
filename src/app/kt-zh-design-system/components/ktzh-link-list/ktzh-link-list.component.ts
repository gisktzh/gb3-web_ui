import {Component, Input} from '@angular/core';
import {LinksGroup} from '../../../shared/interfaces/links-group.interface';

@Component({
  selector: 'ktzh-link-list',
  templateUrl: './ktzh-link-list.component.html',
  styleUrls: ['./ktzh-link-list.component.scss']
})
export class KtzhLinkListComponent {
  @Input() public linksGroups: LinksGroup[] = [];
}
