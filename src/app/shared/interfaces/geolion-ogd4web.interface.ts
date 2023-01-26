import {ContactPoint, Dataset, Distribution, Relation} from '../models/geolion-ogd4web-generated.interfaces';

type GeoLionOgd4WebResponseContactPoint = ContactPoint;
type GeoLionOgd4WebResponseRelation = Relation;
type GeoLionOgd4WebResponseDistribution = Distribution;

export interface GeoLionOgd4WebResponse extends Omit<Dataset, 'contactPoint' | 'relation' | 'distribution'> {
  contactPoint: GeoLionOgd4WebResponseContactPoint;
  relation: GeoLionOgd4WebResponseRelation[];
  distribution: GeoLionOgd4WebResponseDistribution[];
}
