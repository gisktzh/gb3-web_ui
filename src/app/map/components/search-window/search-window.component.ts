import {Component, computed, effect, inject, viewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectSelectedSearchResult} from '../../../state/app/reducers/search.reducer';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ResultGroupsComponent} from './result-groups/result-groups.component';
import {BaseSearchContainerComponent} from '../../../shared/components/search/base-search-container/base-search-container.component';
import {SearchBarComponent} from '../../../shared/components/search/search-bar/search-bar.component';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss'],
  imports: [SearchBarComponent, ResultGroupsComponent],
})
export class SearchWindowComponent extends BaseSearchContainerComponent {
  protected override store = inject(Store);

  private readonly configService = inject(ConfigService);
  private readonly resultGroupsComponent = viewChild.required<ResultGroupsComponent>(ResultGroupsComponent);
  public readonly allSearchResults = computed(() =>
    this.resultGroupsComponent()
      .resultGroupComponents()
      .flatMap((resultGroup) => resultGroup.searchResultElements()),
  );
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
  public readonly selectedSearchResult = this.store.selectSignal(selectSelectedSearchResult);
  public readonly searchConfig = this.configService.searchConfig.mapPage;

  constructor() {
    super();

    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));

    effect(() => {
      const selectedSearchResult = this.selectedSearchResult();
      if (selectedSearchResult) {
        queueMicrotask(() => {
          this.searchComponent().searchInput().setTerm(selectedSearchResult.displayString, false);
        });
      }
    });
  }
}
