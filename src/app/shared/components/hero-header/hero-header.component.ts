import {Component, inject, input} from '@angular/core';
import {Store} from '@ngrx/store';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';

@Component({
  selector: 'hero-header',
  templateUrl: './hero-header.component.html',
  styleUrls: ['./hero-header.component.scss'],
})
export class HeroHeaderComponent {
  private readonly store = inject(Store);
  public heroTitle = input('');
  public heroText = input('');
  public heroSubText = input<string>();
  public screenMode = this.store.selectSignal(selectScreenMode);
}
