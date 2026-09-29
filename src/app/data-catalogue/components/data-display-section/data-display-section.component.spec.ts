import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataDisplaySectionComponent} from './data-display-section.component';

describe('DataDisplaySectionComponent', () => {
  let fixture: ComponentFixture<DataDisplaySectionComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [DataDisplaySectionComponent]}).compileComponents();
    fixture = TestBed.createComponent(DataDisplaySectionComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders its section title', () => {
    fixture.componentRef.setInput('sectionTitle', 'Informationen');
    fixture.detectChanges();

    expect(element.querySelector('h2')?.textContent).toBe('Informationen');
  });
});
