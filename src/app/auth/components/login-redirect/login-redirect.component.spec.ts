import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {LoginRedirectComponent} from './login-redirect.component';

describe('LoginRedirectComponent', () => {
  it('explains the login check and offers a route back to the start page', async () => {
    await TestBed.configureTestingModule({imports: [LoginRedirectComponent], providers: [provideRouter([])]}).compileComponents();
    const fixture = TestBed.createComponent(LoginRedirectComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Prüfe Login');
    expect(element.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')).toBe('/');
  });
});
