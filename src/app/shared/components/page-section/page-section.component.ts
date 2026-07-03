import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

export interface TitleLink {
  url: string;
  displayTitle: string;
}

@Component({
  selector: 'page-section',
  templateUrl: './page-section.component.html',
  styleUrls: ['./page-section.component.scss'],
})
export class PageSectionComponent {
  private readonly store = inject(Store);
  public readonly background = input<'primary' | 'accent'>();
  public readonly sectionTitle = input<string>();
  public readonly titleLink = input<TitleLink>();
  public readonly hideBottomPadding = input(false);
  public readonly pageTitle = input(false);
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
