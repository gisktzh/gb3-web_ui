import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {ExpandableListItemComponent} from '../../../../shared/components/expandable-list-item/expandable-list-item.component';

@Component({
  selector: 'search-result-group',
  templateUrl: './search-result-group.component.html',
  styleUrls: ['./search-result-group.component.scss'],
  imports: [ExpandableListItemComponent],
})
export class SearchResultGroupComponent {
  private readonly store = inject(Store);

  public readonly header = input('');
  public readonly loadingState = input<LoadingState>();
  public readonly numberOfItems = input(0);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
