export interface Products {
  timestamp: string;
  formats: ProductFormat[];
  products: Product[];
  municipalities: Municipality[];
}

interface ProductFormat {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  type: string;
  formats: number[];
}

interface Municipality {
  id: string;
  name: string;
}
