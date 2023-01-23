import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BackgroundMapSelectorComponent} from './background-map-selector.component';

describe('BackgroundMapSelectorComponent', () => {
  let component: BackgroundMapSelectorComponent;
  let fixture: ComponentFixture<BackgroundMapSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackgroundMapSelectorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BackgroundMapSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
