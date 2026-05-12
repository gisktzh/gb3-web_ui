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
  public background = input<'primary' | 'accent'>();
  public sectionTitle = input<string>();
  public titleLink = input<TitleLink>();
  public hideBottomPadding = input(false);
  public pageTitle = input(false);
  public screenMode = this.store.selectSignal(selectScreenMode);
}
