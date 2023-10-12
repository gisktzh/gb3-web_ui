import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';

@Component({
  selector: 'ui-toggle',
  templateUrl: './ui-toggle.component.html',
  styleUrls: ['./ui-toggle.component.scss'],
})
export class UiToggleComponent {
  public checked: boolean = false;

  constructor(private readonly store: Store) {}

  public hideUiElements() {
    this.checked = !this.checked;
    this.store.dispatch(MapUiActions.changeUiElementsVisibility({hideAllUiElements: this.checked, hideUiToggleButton: false}));
  }
}
