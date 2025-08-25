import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
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
export class UiToggleComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public checked: boolean = false;
  public hideUiElementsButton: boolean = false;

  private readonly hideUiElements$ = this.store.select(selectHideUiElements);
  private readonly hideToggleUiElementsButton$ = this.store.select(selectHideToggleUiElementsButton);
  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public toggleUiElementsVisibility() {
    this.store.dispatch(MapUiActions.changeUiElementsVisibility({hideAllUiElements: !this.checked, hideUiToggleButton: false}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.hideUiElements$.pipe(tap((hideAllUiElements) => (this.checked = hideAllUiElements))).subscribe());
    this.subscriptions.add(
      this.hideToggleUiElementsButton$
        .pipe(tap((hideToggleUiElementsButton) => (this.hideUiElementsButton = hideToggleUiElementsButton)))
        .subscribe(),
    );
  }
}
