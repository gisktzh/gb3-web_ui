import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GenericUnorderedListComponent} from './generic-unordered-list.component';
import {inputBinding, signal, TemplateRef, Component} from '@angular/core';

describe('GenericUnorderedListComponent', () => {
  let component: GenericUnorderedListComponent<string>;
  let fixture: ComponentFixture<GenericUnorderedListComponent<string>>;
  let compiled: HTMLElement;

  const listData = signal<string[]>([]);
  const itemTemplate = signal<TemplateRef<unknown> | null>(null);
  const hasGap = signal<boolean>(false);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenericUnorderedListComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(GenericUnorderedListComponent<string>, {
      bindings: [inputBinding('listData', listData), inputBinding('itemTemplate', itemTemplate), inputBinding('hasGap', hasGap)],
    });

    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render empty list when no data is provided', () => {
    expect(compiled.querySelectorAll<HTMLLIElement>('.list__item').length).toBe(0);
  });

  it('should apply gap class when hasGap is true', () => {
    hasGap.set(true);

    fixture.detectChanges();

    const list = compiled.querySelector<HTMLUListElement>('.list');

    expect(list?.classList).toContain('list--gap');
  });

  it('should not apply gap class when hasGap is false', () => {
    hasGap.set(false);

    fixture.detectChanges();

    const list = compiled.querySelector<HTMLUListElement>('.list');

    expect(list?.classList).not.toContain('list--gap');
  });

  it('should render one list item per data item', () => {
    listData.set(['First', 'Second', 'Third']);

    fixture.detectChanges();

    expect(compiled.querySelectorAll<HTMLLIElement>('.list__item').length).toBe(3);
  });

  it('should render item template content for every item', () => {
    @Component({
      template: `
        <generic-list [listData]="items" [itemTemplate]="template" />

        <ng-template #template let-item>
          <span class="template-item">{{ item }}</span>
        </ng-template>
      `,
      imports: [GenericUnorderedListComponent],
    })
    class TestHostComponent {
      public readonly items = ['One', 'Two'];

      public readonly template!: TemplateRef<unknown>;
    }

    const hostFixture = TestBed.createComponent(TestHostComponent);

    hostFixture.detectChanges();

    const hostElement = hostFixture.nativeElement as HTMLElement;

    const renderedItems = hostElement.querySelectorAll<HTMLSpanElement>('.template-item');

    expect(renderedItems.length).toBe(2);
    expect(renderedItems[0]?.textContent).toContain('One');
    expect(renderedItems[1]?.textContent).toContain('Two');
  });

  it('should update rendered items when listData changes', () => {
    listData.set(['First']);

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.list__item').length).toBe(1);

    listData.set(['First', 'Second']);

    fixture.detectChanges();

    expect(compiled.querySelectorAll('.list__item').length).toBe(2);
  });
});
