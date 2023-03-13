interface MapFilterValue {
  name: string;
  values: string[];
  isActive: boolean;
}

export interface MapFilter {
  parameter: string;
  filterValues: MapFilterValue[];
}
