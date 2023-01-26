import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DataCatalogueDetailComponent} from './data-catalogue-detail.component';

describe('DataCatalogueDetailComponent', () => {
  let component: DataCatalogueDetailComponent;
  let fixture: ComponentFixture<DataCatalogueDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataCatalogueDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataCatalogueDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
