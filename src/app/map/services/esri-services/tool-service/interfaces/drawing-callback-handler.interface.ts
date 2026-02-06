import Graphic from '@arcgis/core/Graphic';
import {DataDownloadSelection} from '../../../../../shared/interfaces/data-download-selection.interface';
import {DrawingMode} from '../types/drawing-mode.type';
import {Gb3StyleRepresentation} from 'src/app/shared/interfaces/internal-drawing-representation.interface';
import {MapDrawingSymbol} from 'src/app/shared/interfaces/map-drawing-symbol.interface';

export type DrawingCallbackHandlerArgsDrawing = 'completeDrawing';
export type DrawingCallbackHandlerArgsTextDrawing = 'completeTextDrawing';
export type DrawingCallbackHandlerArgsSymbolDrawing = 'completeSymbolDrawing';
export type DrawingCallbackHandlerArgsMeasurement = 'completeMeasurement';
export type DrawingCallbackHandlerArgsSelection = 'completeSelection';

export type DrawingCallbackHandlerArgsType =
  | DrawingCallbackHandlerArgsDrawing
  | DrawingCallbackHandlerArgsTextDrawing
  | DrawingCallbackHandlerArgsSymbolDrawing
  | DrawingCallbackHandlerArgsMeasurement
  | DrawingCallbackHandlerArgsSelection;

export type DrawingCallbackHandlerArgsLists<SymbolType extends MapDrawingSymbol = MapDrawingSymbol> = {
  completeDrawing: [Graphic, DrawingMode];
  completeTextDrawing: [Graphic, DrawingMode, string?];
  completeSymbolDrawing: [Graphic | undefined, DrawingMode, SymbolType?, number?, number?];
  completeMeasurement: [Graphic, Graphic, string, DrawingMode];
  completeSelection: [DataDownloadSelection | undefined];
};

export type DrawingInternalUpdateArgs<SymbolType extends MapDrawingSymbol = MapDrawingSymbol> = {
  completeDrawing: [Gb3StyleRepresentation];
  completeTextDrawing: [Gb3StyleRepresentation, string];
  completeSymbolDrawing: [Gb3StyleRepresentation, SymbolType];
};

export type DrawingCallbackHandler<
  ArgsType extends DrawingCallbackHandlerArgsType,
  SymbolType extends MapDrawingSymbol = MapDrawingSymbol,
> = (...args: DrawingCallbackHandlerArgsLists<SymbolType>[ArgsType]) => void;
