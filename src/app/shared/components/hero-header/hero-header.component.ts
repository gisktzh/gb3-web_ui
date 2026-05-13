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
  public readonly heroTitle = input('');
  public readonly heroText = input('');
  public readonly heroSubText = input<string>();
  public readonly screenMode = this.store.selectSignal(selectScreenMode);
}
