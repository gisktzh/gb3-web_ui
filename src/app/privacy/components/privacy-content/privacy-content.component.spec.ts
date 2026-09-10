import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PrivacyContentComponent} from './privacy-content.component';

describe('PrivacyContentComponent', () => {
  let component: PrivacyContentComponent;
  let fixture: ComponentFixture<PrivacyContentComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivacyContentComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyContentComponent);

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render privacy content headings', () => {
    const headings = compiled.querySelectorAll<HTMLHeadingElement>('h3');

    expect(headings.length).toBeGreaterThan(0);
    expect(headings[0]?.textContent).toContain('Umfang der Verarbeitung personenbezogener Daten');
  });

  it('should render paragraphs', () => {
    const paragraphs = compiled.querySelectorAll<HTMLParagraphElement>('p');

    expect(paragraphs.length).toBeGreaterThan(0);
  });

  it('should render data processing section', () => {
    expect(compiled.textContent).toContain('Beschreibung und Umfang der Datenverarbeitung');
  });

  it('should render cookies section', () => {
    expect(compiled.textContent).toContain('Verwendung von Cookies');
  });

  it('should render registration section', () => {
    expect(compiled.textContent).toContain('Registrierung');
  });

  it('should render unordered lists', () => {
    const lists = compiled.querySelectorAll<HTMLUListElement>('ul');

    expect(lists.length).toBeGreaterThan(0);
  });

  it('should render list items', () => {
    const listItems = compiled.querySelectorAll<HTMLLIElement>('li');

    expect(listItems.length).toBeGreaterThan(0);
  });
});
