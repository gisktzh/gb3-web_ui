import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';
import {ExpandableListItemComponent} from '../../../../shared/components/expandable-list-item/expandable-list-item.component';
import {NgClass} from '@angular/common';

@Component({
  selector: 'search-result-group',
  templateUrl: './search-result-group.component.html',
  styleUrls: ['./search-result-group.component.scss'],
  imports: [ExpandableListItemComponent, NgClass],
})
export class SearchResultGroupComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public header: string = '';
  @Input() public loadingState?: LoadingState;
  @Input() public numberOfItems: number = 0;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscribtions: Subscription = new Subscription();

  public ngOnInit(): void {
    this.subscribtions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscribtions.unsubscribe();
  }
}
