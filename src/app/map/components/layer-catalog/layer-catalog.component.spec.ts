import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LayerCatalogComponent} from './layer-catalog.component';

describe('LayerCatalogComponent', () => {
  let component: LayerCatalogComponent;
  let fixture: ComponentFixture<LayerCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerCatalogComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
