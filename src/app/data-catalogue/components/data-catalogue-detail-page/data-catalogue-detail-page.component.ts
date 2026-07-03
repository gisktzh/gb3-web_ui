import {Component, inject, input} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {PageSectionComponent} from '../../../shared/components/page-section/page-section.component';
import {MatButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';

import {MatIcon} from '@angular/material/icon';
import {FormatLineBreaksPipe} from '../../../shared/pipes/format-line-breaks.pipe';

@Component({
  selector: 'data-catalogue-detail-page',
  templateUrl: './data-catalogue-detail-page.component.html',
  styleUrls: ['./data-catalogue-detail-page.component.scss'],
  imports: [PageSectionComponent, MatButton, RouterLink, MatIcon, FormatLineBreaksPipe],
})
export class DataCatalogueDetailPageComponent {
  private readonly store = inject(Store);

  public readonly baseMetadataInformation = input.required<BaseMetadataInformation>();
  public readonly screenMode = this.store.selectSignal(selectScreenMode);

  protected readonly mainPageEnum = MainPage;
}
