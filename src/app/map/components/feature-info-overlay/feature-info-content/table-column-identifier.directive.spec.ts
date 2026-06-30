import {Component, signal} from '@angular/core';
import {TestBed, ComponentFixture} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {TableColumnIdentifierDirective} from './table-column-identifier.directive';

@Component({
  template: ` <div tableColumnIdentifier [topicId]="topicId()" [layerId]="layerId()" [featureId]="featureId()"></div> `,
  imports: [TableColumnIdentifierDirective],
  standalone: true,
})
class TestComponent {
  public readonly topicId = signal('topicA');
  public readonly layerId = signal('layerB');
  public readonly featureId = signal(42);
}

describe('TableColumnIdentifierDirective', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, TableColumnIdentifierDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  it('creates unique identifier from inputs', () => {
    const dir = fixture.debugElement.query(By.directive(TableColumnIdentifierDirective)).injector.get(TableColumnIdentifierDirective);

    expect(dir.uniqueIdentifier).toBe('topicA_layerB_42');
  });

  it('updates identifier when inputs change', () => {
    const comp = fixture.componentInstance;

    comp.topicId.set('topicX');
    comp.layerId.set('layerY');
    comp.featureId.set(99);

    fixture.detectChanges();

    const dir = fixture.debugElement.query(By.directive(TableColumnIdentifierDirective)).injector.get(TableColumnIdentifierDirective);
    expect(dir.uniqueIdentifier).toBe('topicX_layerY_99');
  });

  it('static helper creates correct format', () => {
    expect(TableColumnIdentifierDirective.createUniqueColumnIdentifier('t', 'l', 1)).toBe('t_l_1');
  });
});
