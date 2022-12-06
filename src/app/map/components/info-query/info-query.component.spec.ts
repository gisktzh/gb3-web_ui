import {ComponentFixture, TestBed} from '@angular/core/testing';

import {InfoQueryComponent} from './info-query.component';

describe('InfoQueryComponent', () => {
  let component: InfoQueryComponent;
  let fixture: ComponentFixture<InfoQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InfoQueryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(InfoQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
