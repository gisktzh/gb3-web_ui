import {TestBed} from '@angular/core/testing';
import {MockStore, provideMockStore} from '@ngrx/store/testing';
import {selectFaq} from '../../../state/support/reducers/support-content.reducer';
import {FaqComponent} from './faq.component';

describe('FaqComponent', () => {
  it('groups questions by category and formats their answers', async () => {
    await TestBed.configureTestingModule({imports: [FaqComponent], providers: [provideMockStore()]}).compileComponents();
    const store = TestBed.inject(MockStore);
    store.overrideSelector(selectFaq, [
      {category: 'Maps', items: [{uuid: 'faq-1', question: 'Where?', answer: 'In the <strong>catalogue</strong>.'}]},
    ]);
    store.refreshState();
    const fixture = TestBed.createComponent(FaqComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h3')?.textContent).toContain('Maps');
    expect(element.textContent).toContain('Where?');
    expect(element.querySelector('.faq__content strong')?.textContent).toBe('catalogue');
  });
});
