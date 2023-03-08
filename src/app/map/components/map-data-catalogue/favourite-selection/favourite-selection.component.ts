import {Component, OnDestroy, OnInit} from '@angular/core';
import {HasLoadingState} from '../../../../shared/interfaces/has-loading-state.interface';
import {LoadingState} from '../../../../shared/types/loading-state';
import {distinctUntilChanged, Subscription, tap} from 'rxjs';
import {Favourite} from '../../../../shared/interfaces/favourite.interface';
import {Store} from '@ngrx/store';
import {FavouriteListActions} from '../../../../state/map/actions/favourite-list.actions';
import {selectFavourites, selectLoadingState} from '../../../../state/map/reducers/favourite-list.reducer';
import {selectIsAuthenticated} from '../../../../state/auth/reducers/auth-status.reducer';

@Component({
  selector: 'favourite-selection',
  templateUrl: './favourite-selection.component.html',
  styleUrls: ['./favourite-selection.component.scss']
})
export class FavouriteSelectionComponent implements HasLoadingState, OnInit, OnDestroy {
  public favourites: Favourite[] = [];
  public loadingState: LoadingState = 'undefined';
  public isAuthenticated: boolean = false;
  private readonly subscriptions: Subscription = new Subscription();
  private readonly loadingState$ = this.store.select(selectLoadingState);
  private readonly favourites$ = this.store.select(selectFavourites);
  private readonly isAuthenticated$ = this.store.select(selectIsAuthenticated);

  constructor(private readonly store: Store) {}

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public ngOnInit(): void {
    this.subscriptions.add(this.loadingState$.pipe(tap((value) => (this.loadingState = value))).subscribe());
    this.subscriptions.add(this.favourites$.pipe(tap((favourites) => (this.favourites = favourites))).subscribe());
    this.subscriptions.add(
      this.isAuthenticated$
        .pipe(
          distinctUntilChanged(),
          tap((isAuthenticated) => {
            this.isAuthenticated = isAuthenticated;

            // This check is currently needed, because isAuthenticated might not be initialized yet
            if (this.isAuthenticated) {
              this.store.dispatch(FavouriteListActions.loadFavourites());
            }
          })
        )
        .subscribe()
    );
  }

  public addFavouriteToMap() {
    console.log('add to map');
  }
}
