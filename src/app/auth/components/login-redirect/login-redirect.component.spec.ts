import {ComponentFixture, TestBed} from '@angular/core/testing';
import {LoginRedirectComponent} from './login-redirect.component';
import {provideRouter} from '@angular/router';

describe('LoginRedirectComponent', () => {
  let component: LoginRedirectComponent;
  let fixture: ComponentFixture<LoginRedirectComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginRedirectComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginRedirectComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a loading spinner, a text telling what it is doing and instructions on what to do if things do not work', () => {
    expect(compiled.querySelectorAll('mat-spinner').length).toBe(1);
    const links = compiled.querySelectorAll('a');
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/');
    expect(compiled.textContent.trim()).toBe(
      'Prüfe Login... Falls nichts passiert, klicken Sie auf bitte hier oder nutzen Sie die Navigation.',
    );
  });
});
