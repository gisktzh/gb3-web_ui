import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataCatalogueDetailPageSectionComponent} from './data-catalogue-detail-page-section.component';

describe('DataCatalogueDetailPageSectionComponent', () => {
  let component: DataCatalogueDetailPageSectionComponent;
  let fixture: ComponentFixture<DataCatalogueDetailPageSectionComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataCatalogueDetailPageSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataCatalogueDetailPageSectionComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attach a two-column class if the respective input is given', () => {
    const container = compiled.querySelector('div');

    expect(container?.classList).not.toContain('data-catalogue-detail-page-section--row');
    fixture.componentRef.setInput('hasTwoColumns', true);
    fixture.detectChanges();
    expect(container?.classList).toContain('data-catalogue-detail-page-section--row');
  });
});
