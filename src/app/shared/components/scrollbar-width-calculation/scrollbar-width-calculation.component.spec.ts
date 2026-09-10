import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {Mock} from 'vitest';
import {ScrollbarWidthCalculationComponent} from './scrollbar-width-calculation.component';
import {AppLayoutActions} from 'src/app/state/app/actions/app-layout.actions';

describe('ScrollbarWidthCalculationComponent', () => {
  let component: ScrollbarWidthCalculationComponent;
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
    fixture = TestBed.createComponent(ScrollbarWidthCalculationComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(storeDispatchSpy).toHaveBeenCalledWith(AppLayoutActions.setScrollbarWidth({scrollbarWidth: 0}));
  });
});
