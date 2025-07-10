import {Component, OnDestroy, OnInit, inject} from '@angular/core';
import {MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {toolTipFactoryMapToolsAndControls} from 'src/app/shared/factories/tooltip-map-tools-and-controls.factory';
import {ConfigService} from 'src/app/shared/services/config.service';
import {ScreenMode} from 'src/app/shared/types/screen-size.type';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

@Component({
  selector: 'map-tools',
  templateUrl: './map-tools.component.html',
  styleUrls: ['./map-tools.component.scss'],
  providers: [{provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useFactory: toolTipFactoryMapToolsAndControls, deps: [ConfigService]}],
  standalone: false,
})
export class MapToolsComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);

  private readonly subscriptions: Subscription = new Subscription();

  public ngOnInit() {
    this.initSubscriptions();
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
