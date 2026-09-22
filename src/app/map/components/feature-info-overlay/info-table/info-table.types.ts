export type CellType = 'text' | 'url' | 'image' | 'list';

export interface AbstractTableCell {
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

export interface TableHeader {
  displayValue: string;
}

export interface TableRow<TCell extends TableCell = TableCell> {
  label: string;
  cells: TCell[];
}

export interface TableData<THeader extends TableHeader = TableHeader, TCell extends TableCell = TableCell> {
  headers: THeader[];
  rows: TableRow<TCell>[];
}
