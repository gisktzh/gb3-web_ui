import {ComponentFixture, TestBed} from '@angular/core/testing';

import {FeatureInfoComponent} from './feature-info.component';
import {provideMockStore} from '@ngrx/store/testing';

describe('FeatureInfoComponent', () => {
  let component: FeatureInfoComponent;
  let fixture: ComponentFixture<FeatureInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FeatureInfoComponent],
      providers: [provideMockStore({})]
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
