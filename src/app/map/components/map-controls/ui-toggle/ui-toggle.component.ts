import {Component, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {MapUiActions} from 'src/app/state/map/actions/map-ui.actions';
import {selectHideToggleUiElementsButton, selectHideUiElements} from 'src/app/state/map/reducers/map-ui.reducer';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSlideToggle} from '@angular/material/slide-toggle';

@Component({
  selector: 'ui-toggle',
  templateUrl: './ui-toggle.component.html',
  styleUrls: ['./ui-toggle.component.scss'],
  imports: [MatIconButton, MatTooltip, MatSlideToggle],
})
export class UiToggleComponent {
  private readonly store = inject(Store);

  public readonly checked = this.store.selectSignal(selectHideUiElements);
  public readonly hideUiElementsButton = this.store.selectSignal(selectHideToggleUiElementsButton);

  public toggleUiElementsVisibility() {
    this.store.dispatch(MapUiActions.changeUiElementsVisibility({hideAllUiElements: !this.checked(), hideUiToggleButton: false}));
  }
}
