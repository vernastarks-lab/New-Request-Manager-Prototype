export interface AgencyDetail {
  name: string;
  specialism: string;
  ranking: number;
  location: string;
  placements: number;
  status?: 'excluded' | 'incompatible';
  incompatibleReason?: string;
}

export interface Student {
  name: string;
  details: string;
  block: string;
  period: string;
  specialism: string;
  location: string;
  agencies: string[];
  requestedAgencies: string[];
  queuedAgencyDetails: AgencyDetail[];
  agencyDetails: AgencyDetail[];
}
