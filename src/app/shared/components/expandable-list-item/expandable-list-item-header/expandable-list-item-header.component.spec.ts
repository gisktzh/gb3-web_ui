import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExpandableListItemHeaderComponent} from './expandable-list-item-header.component';
import {inputBinding, signal} from '@angular/core';
import {LoadingState} from 'src/app/shared/types/loading-state.type';

describe('ExpandableListItemHeaderComponent', () => {
  let component: ExpandableListItemHeaderComponent;
  let fixture: ComponentFixture<ExpandableListItemHeaderComponent>;
  let compiled: HTMLElement;

  const title = signal<string>('Test title');
  const isExpanded = signal<boolean>(true);
  const loadingState = signal<LoadingState | undefined>(undefined);
  const numberOfItems = signal<number | undefined>(0);
  const showBadge = signal<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandableListItemHeaderComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableListItemHeaderComponent, {
      bindings: [
        inputBinding('title', title),
        inputBinding('isExpanded', isExpanded),
        inputBinding('loadingState', loadingState),
        inputBinding('numberOfItems', numberOfItems),
        inputBinding('showBadge', showBadge),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title text and title attribute', () => {
    title.set('Catalogue items');
    fixture.detectChanges();

    const titleElement = compiled.querySelector<HTMLParagraphElement>('.expandable-list-item-header__title');

    expect(titleElement).toBeTruthy();
    expect(titleElement?.textContent).toContain('Catalogue items');
    expect(titleElement?.getAttribute('title')).toBe('Catalogue items');
  });

  it('should set expanded data-test-id when expanded', () => {
    isExpanded.set(true);
    fixture.detectChanges();

    const container = compiled.querySelector<HTMLElement>('.expandable-list-item-header');

    expect(container?.getAttribute('data-test-id')).toBe('hide-catalogue-items-of-the-map');
  });

  it('should set collapsed data-test-id when not expanded', () => {
    isExpanded.set(false);
    fixture.detectChanges();

    const container = compiled.querySelector<HTMLElement>('.expandable-list-item-header');

    expect(container?.getAttribute('data-test-id')).toBe('show-catalogue-items-of-the-map');
  });

  it('should show expand icon when expanded', () => {
    isExpanded.set(true);
    fixture.detectChanges();

    const icon = compiled.querySelector<HTMLElement>('.expandable-list-item-header__expand-icon');

    expect(icon?.getAttribute('fonticon')).toBe('arrow_drop_up');
  });

  it('should show collapse icon when collapsed', () => {
    isExpanded.set(false);
    fixture.detectChanges();

    const icon = compiled.querySelector<HTMLElement>('.expandable-list-item-header__expand-icon');

    expect(icon?.getAttribute('fonticon')).toBe('arrow_drop_down');
  });

  it('should render badge when showBadge is true', () => {
    showBadge.set(true);
    numberOfItems.set(5);
    fixture.detectChanges();

    const badge = compiled.querySelector<HTMLElement>('.expandable-list-item-header__badge');

    expect(badge).toBeTruthy();
    expect(badge!.textContent.trim()).toBe('5');
  });

  it('should hide badge styling when numberOfItems is zero', () => {
    showBadge.set(true);
    numberOfItems.set(0);
    fixture.detectChanges();

    const badge = compiled.querySelector<HTMLElement>('.expandable-list-item-header__badge');

    expect(badge?.classList).toContain('result-group__header__inner__badge--hidden');
  });

  it('should not render badge when showBadge is false', () => {
    showBadge.set(false);
    fixture.detectChanges();

    const badge = compiled.querySelector<HTMLElement>('.expandable-list-item-header__badge');

    expect(badge).toBeFalsy();
  });

  it('should pass loading state to loading and process bar', () => {
    loadingState.set('loading');
    fixture.detectChanges();

    const progressBar = compiled.querySelector<HTMLElement>('mat-progress-bar');

    expect(progressBar).toBeTruthy();
    expect(progressBar!.getAttribute('mode')).toBe('query');
  });
});
