import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MatDialogClose, MatDialogRef} from '@angular/material/dialog';
import {By} from '@angular/platform-browser';
import {Mock} from 'vitest';
import {ApiDialogWrapperComponent} from '../api-dialog-wrapper/api-dialog-wrapper.component';
import {DrawingSymbolsComponent} from '../drawing-symbols/drawing-symbols.component';
import {SymbolStyleConstants} from 'src/app/shared/constants/symbol-style.constants';
import {SymbolDrawingToolInputComponent} from './symbol-drawing-tool-input.component';
import {DrawingSymbolsService} from 'src/app/shared/interfaces/drawing-symbols-service.interface';
import {DRAWING_SYMBOLS_SERVICE} from 'src/app/app.tokens';
import {of} from 'rxjs';

describe('SymbolDrawingToolInputComponent', () => {
  let component: SymbolDrawingToolInputComponent;
  let fixture: ComponentFixture<SymbolDrawingToolInputComponent>;
  let dialogRefMock: Partial<MatDialogRef<SymbolDrawingToolInputComponent, SymbolDrawingToolInputComponent>>;
  let dialogCloseSpy: Mock;
  const drawingSymbolsServiceMock: Partial<DrawingSymbolsService> = {
    convertToMapDrawingSymbol: vi.fn(),
    getCollectionInfos: vi.fn(() => ({a: {label: 'asdf', url: 'https://www.example.com'}})),
    getCollection: vi.fn(() => of([])),
  };

  beforeEach(async () => {
    dialogCloseSpy = vi.fn();
    dialogRefMock = {
      close: dialogCloseSpy,
    };

    await TestBed.configureTestingModule({
      imports: [SymbolDrawingToolInputComponent],
      providers: [
        {provide: MatDialogRef, useValue: dialogRefMock},
        {provide: DRAWING_SYMBOLS_SERVICE, useValue: drawingSymbolsServiceMock},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SymbolDrawingToolInputComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the dialog wrapper with the correct title', () => {
    const wrapper = fixture.debugElement.query(By.directive(ApiDialogWrapperComponent));
    const wrapperComponent = wrapper.componentInstance as ApiDialogWrapperComponent;

    expect(wrapperComponent.title()).toBe('Symbolauswahl');
  });

  it('should render the drawing symbols component', () => {
    const drawingSymbols = fixture.debugElement.query(By.directive(DrawingSymbolsComponent));

    expect(drawingSymbols).toBeTruthy();
  });

  it('should initialize size with the default symbol size', () => {
    expect(component.size()).toBe(SymbolStyleConstants.DEFAULT_SYMBOL_SIZE);
  });

  it('should initialize rotation with the default symbol rotation', () => {
    expect(component.rotation()).toBe(SymbolStyleConstants.DEFAULT_SYMBOL_ROTATION);
  });

  it('should initialize drawing symbol definition with null', () => {
    expect(component.drawingSymbolDefinition()).toBeNull();
  });

  it('should disable the add button when no symbol is selected', () => {
    const dialogClose = fixture.debugElement.query(By.directive(MatDialogClose));
    const button = dialogClose.nativeElement as HTMLButtonElement;

    expect(button.disabled).toBe(true);
    expect(button.textContent?.trim()).toBe('Hinzufügen');
  });

  it('should pass the size to the drawing symbols component', () => {
    const drawingSymbols = fixture.debugElement.query(By.directive(DrawingSymbolsComponent));
    const drawingSymbolsComponent = drawingSymbols.componentInstance as DrawingSymbolsComponent;

    expect(drawingSymbolsComponent.size()).toBe(SymbolStyleConstants.DEFAULT_SYMBOL_SIZE);
  });

  it('should pass the rotation to the drawing symbols component', () => {
    const drawingSymbols = fixture.debugElement.query(By.directive(DrawingSymbolsComponent));
    const drawingSymbolsComponent = drawingSymbols.componentInstance as DrawingSymbolsComponent;

    expect(drawingSymbolsComponent.rotation()).toBe(SymbolStyleConstants.DEFAULT_SYMBOL_ROTATION);
  });

  it('should pass the initial null symbol definition to the drawing symbols component', () => {
    const drawingSymbols = fixture.debugElement.query(By.directive(DrawingSymbolsComponent));
    const drawingSymbolsComponent = drawingSymbols.componentInstance as DrawingSymbolsComponent;

    expect(drawingSymbolsComponent.symbol()).toBeNull();
  });

  it('should close the dialog when the wrapper emits closeEvent', () => {
    const wrapper = fixture.debugElement.query(By.directive(ApiDialogWrapperComponent));
    const wrapperComponent = wrapper.componentInstance as ApiDialogWrapperComponent;

    wrapperComponent.closeEvent.emit();

    expect(dialogCloseSpy).toHaveBeenCalledOnce();
    expect(dialogCloseSpy).toHaveBeenCalledWith();
  });

  it('should render the add button with the dialog close directive', () => {
    const dialogClose = fixture.debugElement.query(By.directive(MatDialogClose));

    expect(dialogClose).toBeTruthy();
  });

  it('should bind the current dialog result to the add button', () => {
    const dialogClose = fixture.debugElement.query(By.directive(MatDialogClose));
    const dialogCloseDirective = dialogClose.injector.get(MatDialogClose);

    expect(dialogCloseDirective.dialogResult).toEqual({
      drawingSymbolDefinition: null,
      size: SymbolStyleConstants.DEFAULT_SYMBOL_SIZE,
      rotation: SymbolStyleConstants.DEFAULT_SYMBOL_ROTATION,
    });
  });

  it('should bind the current size and rotation to the dialog result', () => {
    const drawingSymbols = fixture.debugElement.query(By.directive(DrawingSymbolsComponent));
    const drawingSymbolsComponent = drawingSymbols.componentInstance as DrawingSymbolsComponent;

    drawingSymbolsComponent.size.set(42);
    drawingSymbolsComponent.rotation.set(90);
    fixture.detectChanges();

    const dialogClose = fixture.debugElement.query(By.directive(MatDialogClose));
    const dialogCloseDirective = dialogClose.injector.get(MatDialogClose);

    expect(dialogCloseDirective.dialogResult).toEqual({
      drawingSymbolDefinition: null,
      size: 42,
      rotation: 90,
    });
  });
});
