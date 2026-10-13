import {inputBinding, signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectScreenMode} from '../../../../state/app/reducers/app-layout.reducer';
import {SearchResultGroupComponent} from './search-result-group.component';

describe('SearchResultGroupComponent', () => {
  it('passes group state to the expandable item and adapts projected content for mobile', async () => {
    const header = signal('Maps');
    const count = signal(3);
    await TestBed.configureTestingModule({imports: [SearchResultGroupComponent], providers: [provideMockStore()]}).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectScreenMode, 'regular');
    store.refreshState();
    const fixture = TestBed.createComponent(SearchResultGroupComponent, {
      bindings: [inputBinding('header', header), inputBinding('numberOfItems', count)],
    });
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('expandable-list-item')?.textContent).toContain('Maps');

    store.overrideSelector(selectScreenMode, 'mobile');
    store.refreshState();
    fixture.detectChanges();
    expect(element.querySelector('.search-result-group__content')?.classList).toContain('search-result-group__content--mobile');
  });
});
