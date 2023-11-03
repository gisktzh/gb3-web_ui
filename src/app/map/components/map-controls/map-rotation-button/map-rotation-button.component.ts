import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapConfigActions} from 'src/app/state/map/actions/map-config.actions';
import {selectRotation} from '../../../../state/map/reducers/map-config.reducer';

@Component({
  selector: 'map-rotation-button',
  templateUrl: './map-rotation-button.component.html',
  styleUrls: ['./map-rotation-button.component.scss'],
})
export class MapRotationButtonComponent {
  public rotation: number = 0;
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly rotation$ = this.store.select(selectRotation);
  private readonly screenMode$ = this.store.select(selectScreenMode);

  constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public resetRotation() {
    this.store.dispatch(MapConfigActions.setRotation({rotation: 0}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.rotation$.pipe(tap((rotation) => (this.rotation = rotation))).subscribe());
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
