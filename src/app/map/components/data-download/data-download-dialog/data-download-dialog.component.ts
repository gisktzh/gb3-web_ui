import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from '../../../../state/map/actions/map-ui.actions';

@Component({
  selector: 'data-download-dialog',
  templateUrl: './data-download-dialog.component.html',
  styleUrls: ['./data-download-dialog.component.scss'],
})
export class DataDownloadDialogComponent {
  constructor(private readonly store: Store) {}
  public close() {
    this.store.dispatch(MapUiActions.hideMapSideDrawerContent());
  }
}
