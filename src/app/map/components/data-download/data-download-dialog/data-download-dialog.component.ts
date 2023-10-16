import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';
import {selectSelection} from '../../../../state/map/reducers/data-download-order.reducer';
import {Subscription, tap} from 'rxjs';
import {DataDownloadSelection} from '../../../../shared/interfaces/data-download-selection.interface';
import {Municipality} from '../../../../shared/interfaces/geoshop-product.interface';

@Component({
  selector: 'data-download-dialog',
  templateUrl: './data-download-dialog.component.html',
  styleUrls: ['./data-download-dialog.component.scss'],
})
export class DataDownloadDialogComponent {
  public selection?: DataDownloadSelection;
  public municipality?: Municipality;

  private readonly selection$ = this.store.select(selectSelection);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  public close() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }

  public initSubscriptions() {
    this.subscriptions.add(
      this.selection$
        .pipe(
          tap((selection) => {
            this.selection = selection;
            if (selection && selection.type === 'select-municipality') {
              this.municipality = selection.municipality;
            } else {
              this.municipality = undefined;
            }
          }),
        )
        .subscribe(),
    );
  }
}
