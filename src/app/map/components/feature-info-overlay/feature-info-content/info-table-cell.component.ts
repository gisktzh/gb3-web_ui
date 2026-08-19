import {Component, input} from '@angular/core';

export type CellType = 'text' | 'url' | 'image' | 'list';

/**
 * Each TableCell has an fid (identifying the feature), a displayvalue and a type. These are then further narrowed down to handle string
 * and linkobject values.
 */
export interface AbstractTableCell {
  fid: number;
  displayValue: string;
  cellType: CellType;
}

export interface TextTableCell extends AbstractTableCell {
  cellType: 'text';
}

export interface UrlTableCell extends AbstractTableCell {
  cellType: 'url';
  url: string;
}

export interface ImageTableCell extends AbstractTableCell {
  cellType: 'image';
  url: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface ListTableCell extends AbstractTableCell {
  cellType: 'list';
  items: TableCell[];
}

export type TableCell = TextTableCell | UrlTableCell | ImageTableCell | ListTableCell;

@Component({
  selector: 'info-table-cell',
  templateUrl: './info-table-cell.component.html',
  styleUrls: ['./info-table-cell.component.scss'],
})
export class InfoTableCellComponent {
  public readonly cellValue = input.required<TableCell>();
}
