import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SkipLinkComponent} from './skip-link.component';
import {inputBinding, signal} from '@angular/core';
import {SkipLink} from '../../types/skip-link.type';
import {SkipLinkTemplateVariable} from '../../enums/skip-link-template-variable.enum';

describe('SkipLinkComponent', () => {
  let component: SkipLinkComponent;
  let fixture: ComponentFixture<SkipLinkComponent>;
  let compiled: HTMLElement;

  const skipLinks = signal<SkipLink[]>([]);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkipLinkComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(SkipLinkComponent, {
      bindings: [inputBinding('skipLinks', skipLinks)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(compiled.querySelectorAll('a').length).toBe(0);
  });

  it('should render one link per given skipLink', async () => {
    vi.useFakeTimers();
    skipLinks.set([
      {
        id: SkipLinkTemplateVariable.MainContent,
        label: 'There',
      },
      {
        id: SkipLinkTemplateVariable.Navigation,
        label: 'And back again',
      },
    ]);

    await vi.runAllTimersAsync();

    const links = compiled.querySelectorAll('a');
    expect(links.length).toBe(2);
    expect(links[0].textContent.trim()).toBe('There');
    expect(links[1].textContent.trim()).toBe('And back again');
  });

  it('should emit the skipToLocationEvent when enter is pressed while a link is focussed', async () => {
    vi.useFakeTimers();
    skipLinks.set([
      {
        id: SkipLinkTemplateVariable.MainContent,
        label: 'There',
      },
      {
        id: SkipLinkTemplateVariable.Navigation,
        label: 'And back again',
      },
    ]);

    await vi.runAllTimersAsync();

    const links = compiled.querySelectorAll('a');
    const eventSpy = vi.spyOn(component.skipToLocationEvent, 'emit');

    links[0].focus();
    links[0].dispatchEvent(new KeyboardEvent('keydown', {key: 'enter'}));
    expect(eventSpy).toHaveBeenCalledWith(SkipLinkTemplateVariable.MainContent);

    links[1].focus();
    links[1].dispatchEvent(new KeyboardEvent('keydown', {key: 'enter'}));
    expect(eventSpy).toHaveBeenCalledWith(SkipLinkTemplateVariable.Navigation);
  });

  it('should emit the skipToLocationEvent when a link is clicked', async () => {
    vi.useFakeTimers();
    skipLinks.set([
      {
        id: SkipLinkTemplateVariable.MainContent,
        label: 'There',
      },
      {
        id: SkipLinkTemplateVariable.Navigation,
        label: 'And back again',
      },
    ]);

    await vi.runAllTimersAsync();

    const links = compiled.querySelectorAll('a');
    const eventSpy = vi.spyOn(component.skipToLocationEvent, 'emit');

    links[0].click();
    expect(eventSpy).toHaveBeenCalledWith(SkipLinkTemplateVariable.MainContent);

    links[1].click();
    expect(eventSpy).toHaveBeenCalledWith(SkipLinkTemplateVariable.Navigation);
  });
});
