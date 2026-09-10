import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Directive, effect, ElementRef, inject, input, inputBinding, signal} from '@angular/core';
import {MapOverlayListItemComponent} from './map-overlay-list-item.component';
import {RouterLink} from '@angular/router';

describe('MapOverlayListItemComponent', () => {
  let component: MapOverlayListItemComponent;
  let fixture: ComponentFixture<MapOverlayListItemComponent>;
  let compiled: HTMLElement;

  const overlayTitle = signal<string | undefined>(undefined);
  const metaDataLink = signal<string>('');
  const forceExpanded = signal<boolean | undefined>(undefined);
  const disabled = signal<boolean | undefined>(undefined);
  const toggleButtonPosition = signal<'start' | 'end' | undefined>(undefined);
  const removeContentIndent = signal<boolean | undefined>(undefined);
  const hasBackgroundColor = signal<boolean | undefined>(undefined);
  const showInteractiveElements = signal<boolean | undefined>(undefined);

  @Directive({
    selector: '[routerLink]',
    standalone: true,
  })
  class RouterLinkStub {
    public readonly routerLink = input<unknown>();

    private readonly elementRef = inject(ElementRef<HTMLElement>);

    constructor() {
      effect(() => {
        const routerLink = this.routerLink();

        if (routerLink) {
          this.elementRef.nativeElement.setAttribute('href', Array.isArray(routerLink) ? routerLink.join('/') : String(routerLink));
        } else {
          this.elementRef.nativeElement.removeAttribute('href');
        }
      });
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapOverlayListItemComponent],
      providers: [],
    })
      .overrideComponent(MapOverlayListItemComponent, {
        remove: {
          imports: [RouterLink],
        },
        add: {
          imports: [RouterLinkStub],
        },
      })
      .compileComponents();

    overlayTitle.set(undefined);
    metaDataLink.set('');
    forceExpanded.set(undefined);
    disabled.set(undefined);
    toggleButtonPosition.set(undefined);
    removeContentIndent.set(undefined);
    hasBackgroundColor.set(undefined);
    showInteractiveElements.set(undefined);

    fixture = TestBed.createComponent(MapOverlayListItemComponent, {
      bindings: [
        inputBinding('overlayTitle', overlayTitle),
        inputBinding('metaDataLink', metaDataLink),
        inputBinding('forceExpanded', forceExpanded),
        inputBinding('disabled', disabled),
        inputBinding('toggleButtonPosition', toggleButtonPosition),
        inputBinding('removeContentIndent', removeContentIndent),
        inputBinding('hasBackgroundColor', hasBackgroundColor),
        inputBinding('showInteractiveElements', showInteractiveElements),
      ],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the expansion panel', () => {
    expect(compiled.querySelector('mat-expansion-panel')).toBeTruthy();
  });

  it('should pass the disabled state to the expansion panel', () => {
    disabled.set(true);
    fixture.detectChanges();

    const expansionPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));

    expect(expansionPanel.componentInstance.disabled).toBe(true);
  });

  it('should pass the forceExpanded state to the expansion panel', () => {
    forceExpanded.set(true);
    fixture.detectChanges();

    const expansionPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));

    expect(expansionPanel.componentInstance.expanded).toBe(true);
  });

  it('should render the overlay title', () => {
    overlayTitle.set('Legende');
    fixture.detectChanges();

    const title = compiled.querySelector('.list-item__header__content__title');

    expect(title?.textContent?.trim()).toBe('Legende');
  });

  it('should use the overlay title as the tooltip', () => {
    overlayTitle.set('Legende');
    fixture.detectChanges();

    const title = compiled.querySelector('.list-item__header__content__title');

    expect(title?.textContent.trim()).toBe('Legende');
  });

  it('should add the no-content-indent class when removeContentIndent is true', () => {
    removeContentIndent.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item--no-content-indent')).toBeTruthy();
  });

  it('should not add the no-content-indent class when removeContentIndent is false', () => {
    removeContentIndent.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item--no-content-indent')).toBeNull();
  });

  it('should add the no-background class when hasBackgroundColor is false', () => {
    hasBackgroundColor.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header--no-background')).toBeTruthy();
  });

  it('should not add the no-background class when hasBackgroundColor is true', () => {
    hasBackgroundColor.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header--no-background')).toBeNull();
  });

  it('should add the end-position class when the toggle button position is end', () => {
    toggleButtonPosition.set('end');
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header__content__toggle--position-end')).toBeTruthy();
  });

  it('should not add the end-position class when the toggle button position is start', () => {
    toggleButtonPosition.set('start');
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header__content__toggle--position-end')).toBeNull();
  });

  it('should render the info link when a metadata link is provided', () => {
    metaDataLink.set('/metadata/123');
    showInteractiveElements.set(true);
    fixture.detectChanges();

    const infoLink = compiled.querySelector('.list-item__header__content__info-link');

    expect(infoLink).toBeTruthy();
    expect(infoLink?.getAttribute('href')).toBe('/metadata/123');
    expect(infoLink?.getAttribute('title')).toBe('Metadaten anzeigen');
  });

  it('should not render the info link when no metadata link is provided', () => {
    metaDataLink.set('');
    showInteractiveElements.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header__content__info-link')).toBeNull();
  });

  it('should not render the info link when interactive elements are disabled', () => {
    metaDataLink.set('/metadata/123');
    showInteractiveElements.set(false);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header__content__info-link')).toBeNull();
  });

  it('should render the info link when interactive elements are enabled', () => {
    metaDataLink.set('/metadata/123');
    showInteractiveElements.set(true);
    fixture.detectChanges();

    expect(compiled.querySelector('.list-item__header__content__info-link')).toBeTruthy();
  });

  it('should stop propagation when the metadata link is clicked', () => {
    metaDataLink.set('/metadata/123');
    showInteractiveElements.set(true);
    fixture.detectChanges();

    const infoLink = fixture.debugElement.query(By.css('.list-item__header__content__info-link'));
    const event = new MouseEvent('click', {bubbles: true});
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');

    infoLink.triggerEventHandler('click', event);

    expect(stopPropagationSpy).toHaveBeenCalledOnce();
  });

  it('should render the toggle icon', () => {
    expect(compiled.querySelector('.list-item__header__content__toggle')).toBeTruthy();
  });

  it('should show the right arrow when the panel is collapsed', () => {
    forceExpanded.set(false);
    fixture.detectChanges();

    const toggle = compiled.querySelector<HTMLElement>('.list-item__header__content__toggle');

    expect(toggle?.getAttribute('fontIcon')).toBe('arrow_right');
  });

  it('should show the down arrow when the panel is expanded', () => {
    forceExpanded.set(true);
    fixture.detectChanges();

    const toggle = compiled.querySelector<HTMLElement>('.list-item__header__content__toggle');

    expect(toggle?.getAttribute('fontIcon')).toBe('arrow_drop_down');
  });

  it('should use the configured forceExpanded state for the expansion panel', () => {
    forceExpanded.set(false);
    fixture.detectChanges();

    const expansionPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));

    expect(expansionPanel.componentInstance.expanded).toBe(false);

    forceExpanded.set(true);
    fixture.detectChanges();

    expect(expansionPanel.componentInstance.expanded).toBe(true);
  });
});
