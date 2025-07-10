import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {MapConfigActions} from 'src/app/state/map/actions/map-config.actions';
import {NgClass} from '@angular/common';
import {MatIconButton} from '@angular/material/button';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {MapRotationPipe} from '../../../pipes/map-rotation.pipe';

@Component({
  selector: 'map-rotation-button',
  templateUrl: './map-rotation-button.component.html',
  styleUrls: ['./map-rotation-button.component.scss'],
  imports: [NgClass, MatIconButton, MatTooltip, MatIcon, MapRotationPipe],
})
export class MapRotationButtonComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public rotation: number = 0;
  public screenMode: ScreenMode = 'regular';

  private readonly subscriptions: Subscription = new Subscription();
  private readonly screenMode$ = this.store.select(selectScreenMode);

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public resetRotation() {
    this.store.dispatch(MapConfigActions.setRotation({rotation: 0}));
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
