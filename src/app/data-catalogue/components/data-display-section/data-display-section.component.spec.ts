import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DataDisplaySectionComponent} from './data-display-section.component';

describe('DataDisplaySectionComponent', () => {
  let component: DataDisplaySectionComponent;
  let fixture: ComponentFixture<DataDisplaySectionComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataDisplaySectionComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(DataDisplaySectionComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display a given title correctly', () => {
    fixture.componentRef.setInput('sectionTitle', 'An unexpected journey');
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toBe('An unexpected journey');
  });
});
