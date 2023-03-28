/**
 * Generated using http://json2ts.com/ and the output from the endpoint.
 */

export interface Produktverwalter {
  amt: string;
  fachstelle: string;
  sektion: string;
  vorname: string;
  nachname: string;
  strassenname: string;
  strassennummer: number;
  plz: number;
  ortschaft: string;
  telnrdirekt: string;
  telnr: string;
  email: string;
  weburl: string;
}

export interface Geodatenbesitzer {
  amt: string;
  fachstelle: string;
  sektion: string;
  vorname: string;
  nachname: string;
  strassenname: string;
  strassennummer: number;
  plz: number;
  ortschaft: string;
  telnrdirekt: string;
  telnr: string;
  email: string;
  weburl: string;
}

export interface Metadatenverwalter {
  amt: string;
  fachstelle: string;
  sektion: string;
  vorname: string;
  nachname: string;
  strassenname: string;
  strassennummer: number;
  plz: number;
  ortschaft: string;
  telnrdirekt: string;
  telnr: string;
  email: string;
  weburl: string;
}

export interface Kontakt {
  geodatenbesitzer: Geodatenbesitzer;
  metadatenverwalter: Metadatenverwalter;
}

export interface Kgeoiv {
  anhang: string;
  zugangberechtigungstufe: string;
}

export interface Rechtlichegrundlagen {
  gesetzestyp: string;
  referenznummer: string;
  titel: string;
  erlasssdatum: string;
}

export interface Wm {
  name: string;
  url: string;
  version: string;
}

export interface Wf {
  name: string;
  url: string;
  version: string;
}

export interface Attribute {
  name: string;
  typ: string;
  einheit: string;
  beschreibung: string;
}

export interface Geodatenelementen {
  name: string;
  giszhnr: string;
  beschreibung: string;
  geometrietyp: string;
  pfad: string;
  sichtbarkeit: string;
  attribute: Attribute[];
}

export interface Geodatensaetze {
  datensatzbildurl: string;
  giszhnr: string;
  bezeichnung: string;
  kontakt: Kontakt;
  kurzbeschreibung: string;
  beschreibung: string;
  geokategorien: string[];
  thesaurus: string;
  datenstand: string;
  nachfuehrungstyp: string;
  bearbeitungstatus: string;
  geometaletzteaenderung: string;
  geographischesgebiet: string;
  referenzsystem: string;
  erfassungsmasstab: number;
  lagegenauigkeit: number;
  aufloesung?: any;
  darstellungstyp: string;
  originalformat: string;
  gesetzklasse: string;
  geobasisdatennummer: string;
  geobasisdatenname: string;
  kgeoiv: Kgeoiv;
  rechtlichegrundlagen: Rechtlichegrundlagen[];
  ogd: string;
  anwendungseinschraenkung: string;
  wms: Wm[];
  wfs: Wf[];
  wcs: any[];
  gbzh_url: string;
  datenerfassung: string;
  datengrundlage: string;
  dokuhtml: string;
  dokupdf: string;
  bemerkungen: string;
  geodatenelementen: Geodatenelementen[];
}

export interface RootObject {
  success: boolean;
  produkt_name: string;
  giszhnr: string;
  beschreibung: string;
  produktverwalter: Produktverwalter;
  produktbildurl: string;
  anzahl_items: number;
  geodatensaetze: Geodatensaetze[];
}
