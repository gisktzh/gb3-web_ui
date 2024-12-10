import {Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Map} from '../../../../shared/interfaces/topic.interface';
import {MainPage} from '../../../../shared/enums/main-page.enum';
import {MapConfigState} from '../../../../state/map/states/map-config.state';
import {Store} from '@ngrx/store';
import {Subscription, tap} from 'rxjs';
import {selectMapConfigState} from '../../../../state/map/reducers/map-config.reducer';

@Component({
  selector: 'search-result-entry-map',
  templateUrl: './search-result-entry-map.component.html',
  styleUrls: ['./search-result-entry-map.component.scss'],
  standalone: false,
})
export class SearchResultEntryMapComponent implements OnInit, OnDestroy {
  @Input() public map!: Map;
  @ViewChild('externalLink') public readonly externalLink?: ElementRef;
  @ViewChild('internalLink') public readonly internalLink?: ElementRef;

  public mapConfigState?: MapConfigState;
  protected readonly mainPageEnum = MainPage;
  private readonly mapConfigState$ = this.store.select(selectMapConfigState);
  private readonly subscriptions: Subscription = new Subscription();

  constructor(private readonly store: Store) {}

  public ngOnInit() {
    this.subscriptions.add(this.mapConfigState$.pipe(tap((mapConfigState) => (this.mapConfigState = mapConfigState))).subscribe());
  }

  public ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  @HostListener('click', ['$event'])
  public onClick(event: MouseEvent) {
    if (event.isTrusted) {
      return;
    }
    if (this.map.gb2Url) {
      this.internalLink?.nativeElement.click();
    } else {
      this.externalLink?.nativeElement.click();
    }
  }
}
