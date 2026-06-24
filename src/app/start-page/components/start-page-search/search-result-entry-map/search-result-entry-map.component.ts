import {Component, inject, input} from '@angular/core';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {Store} from '@ngrx/store';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';
import {MatRipple} from '@angular/material/core';
import {MatTooltip} from '@angular/material/tooltip';
import {NgTemplateOutlet} from '@angular/common';
import {RouterLink} from '@angular/router';
import {ShowTooltipIfTruncatedDirective} from '../../../../shared/directives/show-tooltip-if-truncated.directive';
import {MatIcon} from '@angular/material/icon';
import {MatDivider} from '@angular/material/divider';
import {AppendMapConfigurationToUrlPipe} from '../../../../shared/pipes/append-map-configuration-to-url.pipe';

@Component({
  selector: 'search-result-entry-map',
  templateUrl: './search-result-entry-map.component.html',
  styleUrls: ['./search-result-entry-map.component.scss'],
  imports: [
    MatRipple,
    MatTooltip,
    NgTemplateOutlet,
    RouterLink,
    ShowTooltipIfTruncatedDirective,
    MatIcon,
    MatDivider,
    AppendMapConfigurationToUrlPipe,
  ],
})
export class SearchResultEntryMapComponent {
  private readonly store = inject(Store);

  public readonly map = input.required<Map>();
  public readonly mapConfigState = this.store.selectSignal(selectMapConfigState);
  protected readonly mainPageEnum = MainPage;
  public readonly toolTip: string =
    'Diese Karte ist noch nicht im neuen GIS-Browser verfügbar. Öffnen Sie die Karte im alten GIS-Browser mit diesem Link.';
}
