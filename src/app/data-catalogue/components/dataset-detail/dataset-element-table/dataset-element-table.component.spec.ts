import {ComponentFixture, TestBed} from '@angular/core/testing';
import {DatasetElementTableComponent} from './dataset-element-table.component';

describe('DatasetElementTableComponent', () => {
  let fixture: ComponentFixture<DatasetElementTableComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [DatasetElementTableComponent]}).compileComponents();
    fixture = TestBed.createComponent(DatasetElementTableComponent);
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders accessible layer attributes and placeholders', () => {
    fixture.componentRef.setInput('name', 'Roads');
    fixture.componentRef.setInput('attributes', [
      {name: 'id', description: 'Line one\nLine two', type: 'integer', unit: null},
      {name: null, description: null, type: null, unit: null},
    ]);
    fixture.detectChanges();

    const table = element.querySelector('table');
    const rows = element.querySelectorAll('tr');
    expect(table?.getAttribute('aria-describedby')).toBe('Informationen zu den Attributen von Roads');
    expect(rows).toHaveLength(3);
    expect(rows[1].textContent).toContain('id');
    expect(rows[1].querySelectorAll('td')[1].innerHTML).toContain('<br>');
    expect(Array.from(rows[2].querySelectorAll('td')).map((cell) => cell.textContent?.trim())).toEqual(['-', '-', '-', '-']);
  });
});
