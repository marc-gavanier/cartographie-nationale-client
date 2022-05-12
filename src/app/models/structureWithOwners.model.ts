import { Owner } from './owner.model';
import {Structure} from '@gouvfr-anct/mediation-numerique';

export class StructureWithOwners {
  structure: Structure;
  owners: Owner[];
}
