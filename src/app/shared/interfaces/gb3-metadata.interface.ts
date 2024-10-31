import {LinkObject} from './link-object.interface';
import {DatasetLayer} from './dataset-layer.interface';
import {Image} from './image.interface';

export interface DepartmentalContact {
  department: string;
  /** Fachstelle */
  division: string | null;
  section: string | null;
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: number;
  poBox: string | null;
  zipCode: number;
  village: string;
  phone: string;
  phoneDirect: string;
  email: LinkObject | null;
  url: LinkObject | null;
}

interface BaseMetadataInterface {
  uuid: string;
  gisZHNr: number;
  name: string;
  description: string;
  imageUrl: Image | null;
}

export interface DatasetMetadata extends BaseMetadataInterface {
  shortDescription: string;
  topics: string[] | null;
  keywords: string[] | null;
  dataBasis: string | null;
  dataCapture: string | null;
  remarks: string | null;
  outputFormat: string[];
  scale: number | null;
  resolution: number | null;
  positionAccuracy: number | null;
  scope: string | null;
  dataStatus: string | null;
  updateType: string | null;
  editingStatus: string | null;
  ogd: boolean;
  statuteClass: string | null;
  geoBaseData: LinkObject | null;
  geocat: LinkObject | null;
  opendataSwiss: LinkObject | null;
  mxd: LinkObject | null;
  lyr: LinkObject[] | null;
  pdf: LinkObject | null;
  contact: {
    /** Responsible for geodata */
    geodata: DepartmentalContact;
    /** Responsible contact for metadata */
    metadata: DepartmentalContact;
  };
  maps: {
    uuid: string;
    topic: string;
    name: string;
  }[];
  layers: DatasetLayer[];
  services: {
    uuid: string;
    serviceType: string;
    name: string;
  }[];
  products: {
    uuid: string;
    name: string;
  }[];
}

export interface LinkedDataset {
  uuid: string;
  name: string;
  shortDescription: string;
  gisZHNr: number;
}

export interface MapMetadata extends BaseMetadataInterface {
  topic: string;
  contact: {
    /** Responsible for geodata */
    geodata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
  externalLinks: LinkObject[];
  gb2Url: LinkObject | null;
}

export interface ServiceMetadata extends BaseMetadataInterface {
  serviceType: string;
  url: string;
  version: string;
  access: string;
  contact: {
    /** Kontakt: Zuständig für Geometadaten */
    metadata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
}

export interface ProductMetadata extends BaseMetadataInterface {
  contact: {
    /** Kontakt: Zuständig für Geometadaten */
    metadata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
}
