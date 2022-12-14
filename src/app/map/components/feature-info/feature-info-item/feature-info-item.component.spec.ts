import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FeatureInfoItemComponent} from './feature-info-item.component';

describe('FeatureInfoItemComponent', () => {
  let component: FeatureInfoItemComponent;
  let fixture: ComponentFixture<FeatureInfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureInfoItemComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
