import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NotificationIndicatorComponent} from './notification-indicator.component';

describe('NotificationIndicatorComponent', () => {
  let component: NotificationIndicatorComponent;
  let fixture: ComponentFixture<NotificationIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationIndicatorComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationIndicatorComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
