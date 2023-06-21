import {AfterViewInit, Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {PrintActions} from '../../../state/map/actions/print.actions';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss']
})
export class MapToolsComponent implements AfterViewInit {
  constructor(private readonly store: Store) {}

  public showPrintDialog() {
    this.store.dispatch(PrintActions.setPrintDialogVisible({printDialogVisible: true}));
  }

  public ngAfterViewInit() {
    // TODO WES: remove
    this.showPrintDialog();
  }
}
