import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LayerCatalogComponent} from './layer-catalog.component';
import {provideMockStore} from '@ngrx/store/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('LayerCatalogComponent', () => {
  let component: LayerCatalogComponent;
  let fixture: ComponentFixture<LayerCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayerCatalogComponent],
      imports: [HttpClientTestingModule],
      providers: [provideMockStore({})]
    }).compileComponents();

    fixture = TestBed.createComponent(LayerCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
