import {ComponentFixture, TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {WaitingPageComponent} from './waiting-page.component';
import {inputBinding, signal} from '@angular/core';
import {MainPage} from '../../enums/main-page.enum';

describe('WaitingPageComponent', () => {
  let component: WaitingPageComponent;
  let fixture: ComponentFixture<WaitingPageComponent>;
  let compiled: HTMLElement;

  const waitingText = signal('This is a waiting text');
  const redirectMainPage = signal(MainPage.TermsOfUse);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WaitingPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(WaitingPageComponent, {
      bindings: [inputBinding('waitingText', waitingText), inputBinding('redirectMainPage', redirectMainPage)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(compiled.textContent).toContain(waitingText());
    expect(compiled.querySelector('a')?.getAttribute('href')).toBe(`/${MainPage.TermsOfUse}`);
  });
});
