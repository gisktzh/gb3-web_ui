import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {of} from 'rxjs';
import {GRAV_CMS_SERVICE} from '../../../app.tokens';
import {FrequentlyUsedItem} from '../../../shared/interfaces/frequently-used-item.interface';
import {GravCmsService} from '../../../shared/services/apis/grav-cms/grav-cms.service';
import {selectScreenMode} from '../../../state/app/reducers/app-layout.reducer';
import {FrequentlyUsedItemsComponent} from './frequently-used-items.component';

describe('FrequentlyUsedItemsComponent', () => {
  it('limits content to three items and turns only entries with URLs into links', async () => {
    const items = Array.from({length: 7}, (_, index) => ({
      id: `${index}`,
      title: `Item ${index}`,
      description: `Description ${index}`,
      created: new Date(),
      url: index === 0 ? 'https://example.com/item' : undefined,
    })) as FrequentlyUsedItem[];
    await TestBed.configureTestingModule({
      imports: [FrequentlyUsedItemsComponent],
      providers: [provideMockStore(), {provide: GRAV_CMS_SERVICE, useValue: {loadFrequentlyUsedData: () => of(items)} as GravCmsService}],
    }).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    const fixture = TestBed.createComponent(FrequentlyUsedItemsComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(fixture.componentInstance.loadingState()).toBe('loaded');
    expect(fixture.componentInstance.frequentlyUsedItems()).toHaveLength(3);
    expect(element.querySelectorAll('.frequently-used-items__item')).toHaveLength(3);
    expect(element.querySelectorAll('a.frequently-used-items__item')).toHaveLength(1);
  });
});
