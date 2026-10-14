import {OerebMapOrderItem} from '../interfaces/oereb-map-order-item.interface';

const OerebMapOrder: OerebMapOrderItem[] = [
  {name: 'KatOerebRaumplanungZH', sort: 1},
  {name: 'KatOerebStrassenZH', sort: 2},
  {name: 'KatOerebEisenbahnenZH', sort: 3},
  {name: 'KatOerebFlughaefenZH', sort: 4},
  {name: 'KatOerebBelasteteStandorteZH', sort: 5},
  {name: 'KatOerebWasserZH', sort: 6},
  {name: 'KatOerebLaermZH', sort: 7},
  {name: 'KatOerebWaldZH', sort: 8},
  {name: 'KatOerebVerEntsorgungZH', sort: 9},
];

const OerebAdjacentMapOrder: OerebMapOrderItem[] = [
  {name: 'OerebProjekteZH', sort: 10},
  {name: 'OerebThemenZH', sort: 11},
];

export const OerebMapsWithExtract = OerebMapOrder.map((item) => item.name);

export const OerebMaps = [...OerebMapOrder, ...OerebAdjacentMapOrder].sort((a, b) => a.sort - b.sort).map((item) => item.name);
