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
  guid: number;
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
    guid: number;
    topic: string;
    name: string;
  }[];
  layers: {
    guid: string;
    name: string;
    description: string;
    metadataVisibility: string;
    /** Datenbezugart */
    dataProcurementType: string;
  }[];
  services: {
    guid: number;
    serviceType: string;
    name: string;
  }[];
  products: {
    guid: number;
    name: string;
  }[];
}

export interface MapMetadata {
  guid: number;
  topic: string;
  name: string;
  description: string;
  imageUrl: string | null;
  contact: {
    /** Responsible for geodata */
    geodata: DepartmentalContact;
  };
  datasets: {
    guid: number;
    name: string;
    shortDescription: string;
  }[];
}

export interface ServiceMetadata {
  guid: number;
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
  datasets: {
    guid: number;
    name: string;
    shortDescription: string;
  }[];
}

export interface ProductMetadata {
  guid: number;
  name: string;
  description: string;
  imageUrl: string | null;
  contact: {
    /** Kontakt: Zuständig für Geometadaten */
    metadata: DepartmentalContact;
  };
  datasets: {
    guid: number;
    name: string;
    shortDescription: string;
  }[];
}
