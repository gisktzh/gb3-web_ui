import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectScreenMode} from 'src/app/state/app/reducers/app-layout.reducer';
import {ScreenMode} from '../../types/screen-size.type';

@Component({
  selector: 'hero-header',
  templateUrl: './hero-header.component.html',
  styleUrls: ['./hero-header.component.scss'],
  standalone: false,
})
export class HeroHeaderComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public heroTitle: string = '';
  @Input() public heroText: string = '';
  @Input() public heroSubText?: string;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions = new Subscription();

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
