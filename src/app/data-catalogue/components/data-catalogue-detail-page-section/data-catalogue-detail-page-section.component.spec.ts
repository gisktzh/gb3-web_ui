import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataCatalogueDetailPageSectionComponent} from './data-catalogue-detail-page-section.component';

describe('DataCatalogueDetailPageSectionComponent', () => {
  let fixture: ComponentFixture<DataCatalogueDetailPageSectionComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [DataCatalogueDetailPageSectionComponent]}).compileComponents();
    fixture = TestBed.createComponent(DataCatalogueDetailPageSectionComponent);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('switches to the two-column layout when requested', () => {
    const section = element.querySelector('.data-catalogue-detail-page-section');
    expect(section?.classList.contains('data-catalogue-detail-page-section--row')).toBe(false);

    fixture.componentRef.setInput('hasTwoColumns', true);
    fixture.detectChanges();

    expect(section?.classList.contains('data-catalogue-detail-page-section--row')).toBe(true);
  });
});
