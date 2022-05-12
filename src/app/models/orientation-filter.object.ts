import {Address, Category} from '@gouvfr-anct/mediation-numerique';

export class OrientationFormFilters {
  specificProfile: Category;
  handicap: boolean;
  passNumeric: boolean;
  structureAccompaniment: string;
  contactAccompanimentPhone: string;
  contactAccompanimentEmail: string;
  beneficiaryName: string;
  beneficiaryNeedCommentary: string;
  address: Address;
}
