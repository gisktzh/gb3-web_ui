import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ExpandableListItemComponent} from './expandable-list-item.component';
import {Component, inputBinding, signal} from '@angular/core';
import {LoadingState} from '../../types/loading-state.type';

describe('ExpandableListItemComponent', () => {
  let component: ExpandableListItemComponent;
  let fixture: ComponentFixture<ExpandableListItemComponent>;
  let compiled: HTMLElement;

  const expanded = signal<boolean>(false);
  const header = signal<string>('Header');
  const disabled = signal<boolean>(false);
  const loadingState = signal<LoadingState | undefined>(undefined);
  const numberOfItems = signal<number | undefined>(0);
  const showBadge = signal<boolean>(false);
  const noPadding = signal<boolean>(false);
  const allowTabFocus = signal<boolean>(true);
  const stickyHeader = signal<boolean>(false);
  const renderContentEagerly = signal<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpandableListItemComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpandableListItemComponent, {
      bindings: [
        inputBinding('expanded', expanded),
        inputBinding('header', header),
        inputBinding('disabled', disabled),
        inputBinding('loadingState', loadingState),
        inputBinding('numberOfItems', numberOfItems),
        inputBinding('showBadge', showBadge),
        inputBinding('noPadding', noPadding),
        inputBinding('allowTabFocus', allowTabFocus),
        inputBinding('stickyHeader', stickyHeader),
        inputBinding('renderContentEagerly', renderContentEagerly),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render header text', () => {
    header.set('My expandable header');
    fixture.detectChanges();

    const headerText = compiled.querySelector<HTMLElement>('.expandable-list-item__header__item');

    expect(headerText).toBeTruthy();
    expect(headerText?.textContent).toContain('My expandable header');
  });

  it('should apply no padding class when enabled', () => {
    noPadding.set(true);
    fixture.detectChanges();

    const panel = compiled.querySelector<HTMLElement>('.expandable-list-item');

    expect(panel?.classList).toContain('expandable-list-item--no-padding');
  });

  it('should not apply no padding class when disabled', () => {
    noPadding.set(false);
    fixture.detectChanges();

    const panel = compiled.querySelector<HTMLElement>('.expandable-list-item');

    expect(panel?.classList).not.toContain('expandable-list-item--no-padding');
  });

  it('should disable expansion panel when disabled input is true', () => {
    disabled.set(true);
    fixture.detectChanges();

    const panelHeader = compiled.querySelector<HTMLElement>('mat-expansion-panel-header');

    expect(panelHeader?.getAttribute('aria-disabled')).toBe('true');
  });

  it('should remove tab focus from header when allowTabFocus is false', async () => {
    vi.useFakeTimers();
    allowTabFocus.set(false);
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const panelHeader = compiled.querySelector<HTMLElement>('mat-expansion-panel-header');

    expect(panelHeader?.getAttribute('tabindex')).toBe('-1');
  });

  it('should allow tab focus on header when allowTabFocus is true', async () => {
    vi.useFakeTimers();
    allowTabFocus.set(true);
    fixture.detectChanges();

    await vi.runAllTimersAsync();

    const panelHeader = compiled.querySelector<HTMLElement>('mat-expansion-panel-header');

    expect(panelHeader?.getAttribute('tabindex')).toBe('0');
  });

  it('should render projected content eagerly when enabled', () => {
    @Component({
      template: `
        <expandable-list-item [renderContentEagerly]="true">
          <div class="projected-content">Content</div>
        </expandable-list-item>
      `,
      imports: [ExpandableListItemComponent],
    })
    class HostComponent {}

    const hostFixture = TestBed.createComponent(HostComponent);

    hostFixture.detectChanges();

    const content = (hostFixture.nativeElement as HTMLElement).querySelector<HTMLElement>('.projected-content');

    expect(content).toBeTruthy();
    expect(content?.textContent).toContain('Content');
  });

  it('should apply sticky header classes when sticky header is enabled and panel is expanded', () => {
    stickyHeader.set(true);
    expanded.set(true);
    fixture.detectChanges();

    const panel = compiled.querySelector<HTMLElement>('.expandable-list-item');

    const panelHeader = compiled.querySelector<HTMLElement>('.expandable-list-item__header');

    expect(panel?.classList).toContain('expandable-list-item--sticky-header');

    expect(panelHeader?.classList).toContain('expandable-list-item__header--sticky-header');
  });

  it('should pass loading state to header component', () => {
    loadingState.set('loading');
    fixture.detectChanges();

    const progressBar = compiled.querySelector<HTMLElement>('expandable-list-item-header mat-progress-bar');

    expect(progressBar).toBeTruthy();
    expect(progressBar!.getAttribute('mode')).toBe('query');
  });

  it('should render badge configuration on header component', () => {
    showBadge.set(true);
    numberOfItems.set(5);
    fixture.detectChanges();

    const headerComponent = compiled.querySelector<HTMLElement>('expandable-list-item-header');

    expect(headerComponent!.textContent.trim()).toContain('5');
  });
});
