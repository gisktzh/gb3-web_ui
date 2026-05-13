import {Component, inject} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {Store} from '@ngrx/store';
import {LinkGridListComponent} from '../shared/components/lists/link-grid-list/link-grid-list.component';
import {LinkGridListItemComponent} from '../shared/components/lists/link-grid-list/link-grid-list-item/link-grid-list-item.component';
import {selectExternalAppsForAccessMode} from '../state/external-apps/selectors/external-apps.selector';

@Component({
  selector: 'apps-page',
  standalone: true,
  imports: [SharedModule, LinkGridListComponent, LinkGridListItemComponent],
  templateUrl: './apps-page.component.html',
  styleUrl: './apps-page.component.scss',
})
export class AppsPageComponent {
  private readonly store = inject(Store);

  public readonly externalApps = this.store.selectSignal(selectExternalAppsForAccessMode);
}
