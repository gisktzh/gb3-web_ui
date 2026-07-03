import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectUsefulInformationLinksWithDynamicUrls} from '../../../state/support/selectors/useful-information-links.selector';
import {LinkListComponent} from '../../../shared/components/lists/link-list/link-list.component';

@Component({
  selector: 'useful-information',
  templateUrl: './useful-information.component.html',
  styleUrls: ['./useful-information.component.scss'],
  imports: [LinkListComponent],
})
export class UsefulInformationComponent {
  private readonly store = inject(Store);

  public readonly usefulInformationLinksGroups = this.store.selectSignal(selectUsefulInformationLinksWithDynamicUrls);
}
