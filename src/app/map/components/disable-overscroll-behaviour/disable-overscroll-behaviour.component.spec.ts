import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DisableOverscrollBehaviourComponent} from './disable-overscroll-behaviour.component';

describe('DisableOverscrollBehaviourComponent', () => {
  let component: DisableOverscrollBehaviourComponent;
  let fixture: ComponentFixture<DisableOverscrollBehaviourComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableOverscrollBehaviourComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(DisableOverscrollBehaviourComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
