import {Component, Input, OnDestroy, OnInit, inject} from '@angular/core';
import {MainPage} from '../../../shared/enums/main-page.enum';
import {BaseMetadataInformation} from '../../interfaces/base-metadata-information.interface';
import {ScreenMode} from '../../../shared/types/screen-size.type';
import {Store} from '@ngrx/store';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {Subscription, tap} from 'rxjs';

@Component({
  selector: 'data-catalogue-detail-page',
  templateUrl: './data-catalogue-detail-page.component.html',
  styleUrls: ['./data-catalogue-detail-page.component.scss'],
  standalone: false,
})
export class DataCatalogueDetailPageComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  @Input() public baseMetadataInformation!: BaseMetadataInformation;
  public screenMode: ScreenMode = 'regular';

  private readonly screenMode$ = this.store.select(selectScreenMode);
  private readonly subscriptions: Subscription = new Subscription();

  protected readonly mainPageEnum = MainPage;

  ngOnInit() {
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initSubscriptions() {
    this.subscriptions.add(this.screenMode$.pipe(tap((screenMode) => (this.screenMode = screenMode))).subscribe());
  }
}
