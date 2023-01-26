import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DataCatalogueOverviewComponent} from './data-catalogue-overview.component';

describe('DataCatalogueOverviewComponent', () => {
  let component: DataCatalogueOverviewComponent;
  let fixture: ComponentFixture<DataCatalogueOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DataCatalogueOverviewComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DataCatalogueOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
