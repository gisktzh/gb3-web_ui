/* eslint-disable rxjs-angular-x/prefer-composition -- eslint does not pickup inherited properties*/
import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, inject} from '@angular/core';
import {filter, tap} from 'rxjs';
import {Store} from '@ngrx/store';
import {ConfigService} from '../../../shared/services/config.service';
import {SearchActions} from '../../../state/app/actions/search.actions';
import {selectSelectedSearchResult} from '../../../state/app/reducers/search.reducer';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {ResultGroupsComponent} from './result-groups/result-groups.component';
import {ResultGroupComponent} from './result-groups/result-group/result-group.component';
import {BaseSearchContainerComponent} from '../../../shared/components/search/base-search-container/base-search-container.component';
import {SearchBarComponent} from '../../../shared/components/search/search-bar/search-bar.component';

@Component({
  selector: 'search-window',
  templateUrl: './search-window.component.html',
  styleUrls: ['./search-window.component.scss'],
  imports: [SearchBarComponent, ResultGroupsComponent],
})
export class SearchWindowComponent extends BaseSearchContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  protected override store = inject(Store);
  protected override cdr = inject(ChangeDetectorRef);

  private readonly configService = inject(ConfigService);

  @ViewChild(ResultGroupsComponent) private readonly resultGroupsComponent!: ResultGroupsComponent;

  public screenMode: ScreenMode = 'regular';
  public readonly searchConfig = this.configService.searchConfig.mapPage;

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly selectedSearchResult$ = this.store.select(selectSelectedSearchResult);

  public override ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(SearchActions.setFilterGroups({filterGroups: this.searchConfig.filterGroups}));
    this.initSubscriptions();
  }

  public override ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.unsubscribe();
  }

  public override ngAfterViewInit() {
    super.ngAfterViewInit();
    this.subscriptions.add(
      this.selectedSearchResult$
        .pipe(
          tap((selectedSearchResult) => {
            if (selectedSearchResult) {
              this.searchComponent.searchInput.setTerm(selectedSearchResult.displayString, false);
            }
          }),
        )
        .subscribe(),
    );

    this.subscriptions.add(
      this.resultGroupsComponent.resultGroupComponents.changes.subscribe((resultGroupComponents: ResultGroupComponent[]) => {
        this.allSearchResults = [];
        resultGroupComponents.forEach((resultGroupComponent) => {
          this.allSearchResults = this.allSearchResults.concat(resultGroupComponent.searchResultElements.toArray());
        });
        this.cdr.detectChanges();
      }),
    );

    this.subscriptions.add(
      this.term$
        .pipe(
          filter((term) => term === ''),
          tap((term) => {
            this.searchComponent.searchInput.setTerm(term, false);
          }),
        )
        .subscribe(),
    );
    // Necessary because we are passing the searchComponent to the searchResultKeyboardNavigation directive
    this.cdr.detectChanges();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
