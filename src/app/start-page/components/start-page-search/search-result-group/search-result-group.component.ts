import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {LoadingState} from '../../../../shared/types/loading-state.type';

@Component({
  selector: 'search-result-group',
  templateUrl: './search-result-group.component.html',
  styleUrls: ['./search-result-group.component.scss'],
  standalone: false,
})
export class SearchResultGroupComponent implements OnInit, OnDestroy {
  @Input() public header: string = '';
  @Input() public loadingState?: LoadingState;
  @Input() public numberOfItems: number = 0;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscribtions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.subscribtions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }

  public ngOnDestroy(): void {
    this.subscribtions.unsubscribe();
  }
}
