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
  email: string;
  url: string;
}

interface BaseMetadataInterface {
  uuid: string;
  gisZHNr: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

export interface DatasetMetadata extends BaseMetadataInterface {
  shortDescription: string;
  topics: string | null;
  keywords: string | null;
  dataBasis: string | null;
  remarks: string | null;
  outputFormat: string;
  usageRestrictions: string;
  pdfName: string | null;
  pdfUrl: string | null;
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
  layers: {
    /** GISZH-Nummer */
    id: string;
    name: string;
    description: string;
    metadataVisibility: string;
    /** Datenbezugart */
    dataProcurementType: string;
  }[];
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
}

export interface MapMetadata extends BaseMetadataInterface {
  topic: string;
  contact: {
    /** Responsible for geodata */
    geodata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
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
