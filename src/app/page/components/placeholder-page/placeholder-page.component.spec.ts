import {ComponentFixture, TestBed} from '@angular/core/testing';

import {PlaceholderPageComponent} from './placeholder-page.component';

describe('PlaceholderPage', () => {
  let component: PlaceholderPageComponent;
  let fixture: ComponentFixture<PlaceholderPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlaceholderPageComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaceholderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
