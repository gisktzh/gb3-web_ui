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

export interface DatasetMetadata {
  uuid: string;
  name: string;
  shortDescription: string;
  description: string;
  topics: string | null;
  keywords: string | null;
  dataBasis: string | null;
  remarks: string | null;
  outputFormat: string;
  usageRestrictions: string;
  imageUrl: string | null;
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

export interface MapMetadata {
  uuid: string;
  topic: string;
  name: string;
  description: string;
  imageUrl: string | null;
  contact: {
    /** Responsible for geodata */
    geodata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
}

export interface ServiceMetadata {
  uuid: string;
  serviceType: string;
  name: string;
  description: string;
  url: string;
  version: string;
  access: string;
  imageUrl: string | null;
  contact: {
    /** Kontakt: Zuständig für Geometadaten */
    metadata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
}

export interface ProductMetadata {
  uuid: string;
  name: string;
  description: string;
  imageUrl: string | null;
  contact: {
    /** Kontakt: Zuständig für Geometadaten */
    metadata: DepartmentalContact;
  };
  datasets: LinkedDataset[];
}
