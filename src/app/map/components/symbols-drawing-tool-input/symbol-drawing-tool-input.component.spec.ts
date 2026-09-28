import {Component, input, model, output} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {DrawingSymbolDefinition} from '../../../shared/interfaces/drawing-symbol/drawing-symbol-definition.interface';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {DrawingSymbolsComponent} from '../drawing-symbols/drawing-symbols.component';
import {SymbolDrawingToolInputComponent} from './symbol-drawing-tool-input.component';

@Component({selector: 'api-dialog-wrapper', template: '<ng-content select="[content]"/><ng-content select="[actions]"/>'})
class DialogWrapperStubComponent {
  public readonly title = input('');
  public readonly closeEvent = output<void>();
}

@Component({selector: 'drawing-symbols', template: ''})
class DrawingSymbolsStubComponent {
  public readonly symbol = model<DrawingSymbolDefinition | null>(null);
  public readonly size = model(0);
  public readonly rotation = model(0);
}

describe('SymbolDrawingToolInputComponent', () => {
  let fixture: ComponentFixture<SymbolDrawingToolInputComponent>;
  const dialogRef = {close: vi.fn()};

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [SymbolDrawingToolInputComponent],
      providers: [{provide: MatDialogRef, useValue: dialogRef}],
    })
      .overrideComponent(SymbolDrawingToolInputComponent, {
        remove: {imports: [ApiDialogWrapperComponent, DrawingSymbolsComponent]},
        add: {imports: [DialogWrapperStubComponent, DrawingSymbolsStubComponent]},
      })
      .compileComponents();
    fixture = TestBed.createComponent(SymbolDrawingToolInputComponent);
    fixture.detectChanges();
  });

  it('closes the dialog from the wrapper', () => {
    const wrapper = fixture.debugElement.query(By.directive(DialogWrapperStubComponent)).componentInstance as DialogWrapperStubComponent;
    expect(wrapper.title()).toBe('Symbolauswahl');

    wrapper.closeEvent.emit();

    expect(dialogRef.close).toHaveBeenCalledOnce();
  });

  it('returns the currently selected symbol settings', () => {
    const definition = {type: 'cim'} as DrawingSymbolDefinition;
    fixture.componentInstance.drawingSymbolDefinition.set(definition);
    fixture.componentInstance.size.set(42);
    fixture.componentInstance.rotation.set(90);
    fixture.detectChanges();
    const close = fixture.debugElement.query(By.directive(MatDialogClose)).injector.get(MatDialogClose);

    expect(close.dialogResult).toEqual({drawingSymbolDefinition: definition, size: 42, rotation: 90});
  });
});
