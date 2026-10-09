import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {ScrollbarWidthCalculationComponent} from './scrollbar-width-calculation.component';
import {AppLayoutActions} from 'src/app/state/app/actions/app-layout.actions';

describe('ScrollbarWidthCalculationComponent', () => {
  let fixture: ComponentFixture<ScrollbarWidthCalculationComponent>;
  let store: MockStore;
  let storeDispatchSpy: Mock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollbarWidthCalculationComponent],
      providers: [provideMockStore()],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    storeDispatchSpy = vi.spyOn(store, 'dispatch');
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(100);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(84);
    fixture = TestBed.createComponent(ScrollbarWidthCalculationComponent);

    fixture.detectChanges();
  });

  it('should publish the measured scrollbar width after rendering', () => {
    expect(storeDispatchSpy).toHaveBeenCalledWith(AppLayoutActions.setScrollbarWidth({scrollbarWidth: 16}));
  });
});
