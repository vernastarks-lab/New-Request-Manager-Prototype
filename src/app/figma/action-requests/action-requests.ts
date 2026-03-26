import { ChangeDetectionStrategy, Component, computed, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type NestedColKey = 'groupCode' | 'student' | 'requestedExperience' | 'requestDates' | 'numberOfRequests';

interface ErrefAttribute { id: string; name: string; description?: string; collection: string; }

interface ActionRequest {
  id: string;
  groupCode: string;
  studentName: string;
  studentCode: string;
  studentDetails: string;
  requestedExperience: string;
  requestDateLabel: string;
  requestDateRange: string;
  numberOfRequests: number;
  requestStatus: 'Draft' | 'Pending' | 'Offer Received' | 'Rejected - Acknowledgement Required';
}

interface AgencyGroup {
  id: number;
  name: string;
  emailChecked: boolean;
  partnerChecked: boolean;
  actionedItems: number;
  totalItems: number;
  partner: string;
  region: string;
  partnerDiscipline: string;
  partnerCampus: string;
  partnerAgency: string;
  requests: ActionRequest[];
}

@Component({
  selector: 'app-action-requests',
  imports: [FormsModule],
  templateUrl: './action-requests.html',
  styleUrl: './action-requests.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocClick($event)' },
})
export class ActionRequestsComponent {

  // ── Output ────────────────────────────────────────────────────────────────
  readonly selectionChanged = output<number>();

  // ── Row / selection state ──────────────────────────────────────────────────
  readonly expandedRows      = signal<Set<number>>(new Set());
  readonly selectedAgencies  = signal<Set<number>>(new Set());
  readonly selectedRequests  = signal<Set<string>>(new Set());
  readonly emailAllChecked   = signal(false);
  readonly partnerAllChecked = signal(false);

  // ── Agency (main) col-menu — custom attrs only, no standard-col toggles ───
  readonly showAgencyColMenu   = signal(false);
  readonly agencyAttrMax       = 5;
  readonly agencyAddedAttrs    = signal<ErrefAttribute[]>([]);
  readonly agencyHiddenAttrs   = signal<Set<string>>(new Set());
  readonly agencyAttrOrder     = signal<string[]>([]);
  readonly agencyOpenAttrOptId = signal<string | null>(null);
  readonly agencyShowErref     = signal(false);
  readonly agencyErrefQuery    = signal('');
  readonly agencyAttrSearchQuery     = signal('');
  readonly agencySelectedCollection  = signal<string | null>(null);
  readonly agencyAvailExpanded       = signal(true);

  readonly agencyAttrMap        = computed(() => new Map(this.agencyAddedAttrs().map(a => [a.id, a])));
  readonly agencyAttrRemaining  = computed(() => this.agencyAttrMax - this.agencyAddedAttrs().length);
  readonly agencyAttrColumnOrder = computed(() =>
    this.agencyAttrOrder()
      .map(id => this.agencyAttrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly agencyColLimit = 15;
  readonly agencyColInUse = computed(() =>
    5 + this.agencyAttrColumnOrder().filter(a => !this.agencyHiddenAttrs().has(a.id)).length
  );
  readonly agencyColAtCapacity = computed(() => this.agencyColInUse() >= this.agencyColLimit);

  readonly agencyErrefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_4',  name: 'Ambulance Victoria',              description: 'Metro or Rural classification assigned by Ambulance Victoria.',  collection: 'Clinical'    },
    { id: 'ERREF_5',  name: 'NDIS Provider',                   description: 'Indicates whether the agency is a registered NDIS provider.',    collection: 'Global'      },
    { id: 'ERREF_6',  name: 'Partner Agreement',               description: 'Indicates whether a formal partner agreement is in place.',       collection: 'Global'      },
    { id: 'ERREF_7',  name: 'Accreditation Status',            description: 'Current accreditation status of the placement agency.',          collection: 'Global'      },
    { id: 'ERREF_8',  name: 'Capacity (Annual)',               description: 'Maximum number of students the agency can accommodate per year.', collection: 'Clinical'    },
    { id: 'ERREF_9',  name: 'On-Call Availability',            description: 'Whether the agency supports on-call or after-hours placements.', collection: 'Global'      },
    { id: 'ERREF_10', name: 'Rural & Remote Classification',   description: 'Indicates if the agency is classified as rural or remote.',       collection: 'Location'    },
    { id: 'ERREF_11', name: 'Supervisor Ratio',                description: 'Supervisor-to-student ratio maintained by the agency.',           collection: 'Clinical'    },
    { id: 'ERREF_12', name: 'Teaching Hospital Affiliation',   description: 'Whether the agency has an affiliation with a teaching hospital.', collection: 'Clinical'    },
    { id: 'ERREF_13', name: 'Medicare Provider Number',        description: 'Medicare Provider Number associated with the agency.',            collection: 'Compliance'  },
    { id: 'ERREF_14', name: 'International Placements',        description: 'Whether the agency accepts international students.',               collection: 'Location'    },
    { id: 'ERREF_15', name: 'DHS Working With Children',       description: 'Indicates valid Working With Children check is held.',            collection: 'Compliance'  },
    { id: 'ERREF_16', name: 'Insurance Expiry Date',           description: 'Expiry date of the agency professional indemnity insurance.',     collection: 'Compliance'  },
  ];

  readonly agencyErrefResults = computed(() => {
    const q     = this.agencyErrefQuery().toLowerCase().trim();
    const added = new Set(this.agencyAddedAttrs().map(a => a.id));
    return this.agencyErrefAttributes.filter(
      a => !added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly agencyErrefSearchResults = computed(() => {
    const q = this.agencyAttrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.agencyAttrOrder().map((id: string) => id));
    return this.agencyErrefAttributes.filter(
      (a: ErrefAttribute) => !added.has(a.id) && (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly agencyAttrsAvailable = computed(() =>
    this.agencyAttrColumnOrder().filter(a => this.agencyHiddenAttrs().has(a.id))
  );
  readonly agencyAttrCollections = computed(() => {
    const q = this.agencyAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.agencyAttrOrder().map((id: string) => id));
    const map = new Map<string, number>();
    for (const a of this.agencyErrefAttributes) {
      if (!added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)))
        map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });
  readonly agencyAttrsInCollection = computed(() => {
    const sel = this.agencySelectedCollection();
    if (!sel) return [] as ErrefAttribute[];
    const q = this.agencyAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.agencyAttrOrder().map((id: string) => id));
    return this.agencyErrefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });

  readonly agencyErrefData: Record<string, Record<string, string>> = {
    'Heidelberg Gen. - Cardiology':    { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'Melbourne Emergency Services':    { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'No'  },
    'Royal Ambulance Victoria':        { ERREF_4: 'Rural', ERREF_5: 'No',  ERREF_6: 'Yes' },
    'Queensland Ambulance Service':    { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'City Medical Response Unit':      { ERREF_4: 'Metro', ERREF_5: 'No',  ERREF_6: 'No'  },
  };

  // ── Nested table col-menu ─────────────────────────────────────────────────
  private readonly nestedStdKeys = [
    'groupCode', 'student', 'requestedExperience', 'requestDates', 'numberOfRequests',
  ] as const;

  readonly nestedColDefs: { key: NestedColKey; label: string }[] = [
    { key: 'groupCode',           label: 'Group Code'           },
    { key: 'student',             label: 'Student'              },
    { key: 'requestedExperience', label: 'Requested Experience' },
    { key: 'requestDates',        label: 'Request Dates'        },
    { key: 'numberOfRequests',    label: 'Number of Requests'   },
  ];

  readonly nestedColVisibility = signal<Record<NestedColKey, boolean>>({
    groupCode: true, student: true, requestedExperience: true,
    requestDates: true, numberOfRequests: true,
  });

  readonly showNestedColMenu   = signal(false);
  readonly nestedAttrMax       = 5;
  readonly nestedAddedAttrs    = signal<ErrefAttribute[]>([]);
  readonly nestedHiddenAttrs   = signal<Set<string>>(new Set());
  readonly nestedColumnOrder   = signal<string[]>([
    'groupCode', 'student', 'requestedExperience', 'requestDates', 'numberOfRequests',
  ]);
  readonly nestedOpenAttrOptId = signal<string | null>(null);
  readonly nestedShowErref     = signal(false);
  readonly nestedErrefQuery    = signal('');
  readonly nestedAttrSearchQuery     = signal('');
  readonly nestedSelectedCollection  = signal<string | null>(null);
  readonly nestedAvailExpanded       = signal(true);

  readonly nestedAttrMap          = computed(() => new Map(this.nestedAddedAttrs().map(a => [a.id, a])));
  readonly nestedAttrRemaining    = computed(() => this.nestedAttrMax - this.nestedAddedAttrs().length);
  readonly nestedAttrColumnOrder  = computed(() =>
    this.nestedColumnOrder()
      .filter(k => !(this.nestedStdKeys as readonly string[]).includes(k))
      .map(id => this.nestedAttrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly nestedColLimit = 15;
  readonly nestedColInUse = computed(() =>
    2 + this.nestedColDefs.filter(c => this.nestedColVisibility()[c.key]).length
      + this.nestedAttrColumnOrder().filter(a => !this.nestedHiddenAttrs().has(a.id)).length
  );
  readonly nestedColAtCapacity = computed(() => this.nestedColInUse() >= this.nestedColLimit);

  readonly nestedErrefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_1',  name: 'Aboriginal/Torres Strait',                   description: 'Indicates whether the student identifies as Aboriginal or Torres Strait Islander.',    collection: 'Global'        },
    { id: 'ERREF_2',  name: 'Acknowledgement Availability for Placement', description: 'Confirms the student has acknowledged their availability for this placement block.',    collection: 'Compliance'    },
    { id: 'ERREF_3',  name: 'Ambulance Orientation',                      description: 'Records whether the student has completed the required ambulance orientation session.', collection: 'Allied Health'  },
    { id: 'ERREF_17', name: 'Disability Support Plan',                    description: 'Indicates whether the student has an active disability support plan.',                  collection: 'Global'        },
    { id: 'ERREF_18', name: 'Driver Licence',                             description: 'Whether the student holds a valid driver licence.',                                      collection: 'Compliance'    },
    { id: 'ERREF_19', name: 'First Aid Certificate',                      description: 'Whether the student holds a current first aid certificate.',                             collection: 'Allied Health'  },
    { id: 'ERREF_20', name: 'Flu Vaccination',                            description: 'Whether the student has received the current season flu vaccination.',                   collection: 'Allied Health'  },
    { id: 'ERREF_21', name: 'Hepatitis B Vaccination',                    description: 'Whether the student has completed the Hepatitis B vaccination course.',                  collection: 'Allied Health'  },
    { id: 'ERREF_22', name: 'International Student',                      description: 'Indicates whether the student is an international student.',                             collection: 'Global'        },
    { id: 'ERREF_23', name: 'Police Check Expiry',                        description: 'Expiry date of the student police check clearance.',                                     collection: 'Compliance'    },
    { id: 'ERREF_24', name: 'Student Equity Scholarship',                 description: 'Whether the student is currently receiving an equity scholarship.',                      collection: 'Global'        },
    { id: 'ERREF_25', name: 'CPR Certification',                          description: 'Whether the student holds a current CPR certification.',                                 collection: 'Allied Health'  },
    { id: 'ERREF_26', name: 'Language Background Other Than English',      description: 'Indicates if the student has a language background other than English.',                collection: 'Global'        },
    { id: 'ERREF_27', name: 'Prior Healthcare Experience',                description: 'Whether the student has prior formal healthcare work experience.',                       collection: 'Compliance'    },
  ];

  readonly nestedErrefResults = computed(() => {
    const q     = this.nestedErrefQuery().toLowerCase().trim();
    const added = new Set(this.nestedAddedAttrs().map(a => a.id));
    return this.nestedErrefAttributes.filter(
      a => !added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly nestedErrefSearchResults = computed(() => {
    const q = this.nestedAttrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.nestedAddedAttrs().map((a: ErrefAttribute) => a.id));
    return this.nestedErrefAttributes.filter(
      (a: ErrefAttribute) => !added.has(a.id) && (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly nestedColsAvailable = computed(() =>
    this.nestedColDefs.filter(c => !this.nestedColVisibility()[c.key])
  );

  readonly nestedAttrsAvailable = computed(() =>
    this.nestedAttrColumnOrder().filter(a => this.nestedHiddenAttrs().has(a.id))
  );
  readonly nestedAttrCollections = computed(() => {
    const q = this.nestedAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.nestedAddedAttrs().map((a: ErrefAttribute) => a.id));
    const map = new Map<string, number>();
    for (const a of this.nestedErrefAttributes) {
      if (!added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)))
        map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });
  readonly nestedAttrsInCollection = computed(() => {
    const sel = this.nestedSelectedCollection();
    if (!sel) return [] as ErrefAttribute[];
    const q = this.nestedAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.nestedAddedAttrs().map((a: ErrefAttribute) => a.id));
    return this.nestedErrefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });

  readonly nestedErrefData: Record<string, Record<string, string>> = {
    '0200': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
    '0315': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '0316': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '0287': { ERREF_1: 'Yes', ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '0288': { ERREF_1: 'No',  ERREF_2: 'No',  ERREF_3: 'Yes' },
    '0289': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '4021': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
    '3839': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '3812': { ERREF_1: 'Yes', ERREF_2: 'No',  ERREF_3: 'Yes' },
    '0401': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
    '0402': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
  };

  // ── Send Request modal ────────────────────────────────────────────────────
  readonly showSendModal         = signal(false);
  readonly selectedModalRows     = signal<Set<string>>(new Set());
  readonly showModalBulkDropdown = signal(false);
  readonly modalRowState         = signal<Record<string, { placementType: string; yearLevel: string }>>({});

  readonly modalRequests = computed(() => {
    const sel = this.selectedAgencies();
    return this.agencies
      .filter(a => sel.has(a.id))
      .flatMap(a => a.requests
        .filter(r => r.requestStatus === 'Draft')
        .map(r => ({ req: r, agency: a })));
  });

  readonly allModalSelected = computed(() => {
    const rows = this.modalRequests();
    return rows.length > 0 && this.selectedModalRows().size === rows.length;
  });

  // ── Mock data ─────────────────────────────────────────────────────────────
  readonly agencies: AgencyGroup[] = [
    {
      id: 0,
      name: 'Heidelberg Gen. - Cardiology',
      emailChecked: false,
      partnerChecked: false,
      actionedItems: 0,
      totalItems: 1,
      partner: 'Victoria Health Partners',
      region: 'Metro',
      partnerDiscipline: 'Cardiology',
      partnerCampus: 'Box Hill Campus',
      partnerAgency: 'Heidelberg General',
      requests: [
        { id: '0200', groupCode: 'Not in Group', studentName: 'Carolee Wagner',    studentCode: 'WAG19779494_JJA', studentDetails: '30 Days Cardiology',           requestedExperience: '30 Days Cardiology',           requestDateLabel: 'VS March block', requestDateRange: '02/03/2026 - 31/03/2026', numberOfRequests: 1, requestStatus: 'Draft'    },
      ],
    },
    {
      id: 1,
      name: 'Melbourne Emergency Services',
      emailChecked: false,
      partnerChecked: false,
      actionedItems: 1,
      totalItems: 2,
      partner: 'Metro Health Network',
      region: 'Metro',
      partnerDiscipline: 'Paramedicine',
      partnerCampus: 'Hawthorn Campus',
      partnerAgency: 'Melbourne Emergency',
      requests: [
        { id: '0315', groupCode: 'Not in Group', studentName: 'Ben Trinh',         studentCode: 'AVSTTU0015',      studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'Feb Roster',     requestDateRange: '12/02/2024 - 24/02/2024', numberOfRequests: 1, requestStatus: 'Draft'          },
        { id: '0316', groupCode: 'Not in Group', studentName: 'Chris Krejcie',     studentCode: 'AVSTTU0024',      studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'Feb Roster',     requestDateRange: '12/02/2024 - 24/02/2024', numberOfRequests: 1, requestStatus: 'Offer Received' },
      ],
    },
    {
      id: 2,
      name: 'Royal Ambulance Victoria',
      emailChecked: false,
      partnerChecked: true,
      actionedItems: 2,
      totalItems: 3,
      partner: 'Rural Paramedic Alliance',
      region: 'Rural',
      partnerDiscipline: 'Paramedicine',
      partnerCampus: 'Ballarat Campus',
      partnerAgency: 'Royal Ambulance Vic.',
      requests: [
        { id: '0287', groupCode: 'Not in Group', studentName: 'Clark Larkin',      studentCode: 'AVSTUQ016',       studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'Mar Roster',     requestDateRange: '04/03/2024 - 15/03/2024', numberOfRequests: 1, requestStatus: 'Offer Received'                     },
        { id: '0288', groupCode: 'Not in Group', studentName: 'Debra Trimeles',    studentCode: 'AVSTUD902',       studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'Mar Roster',     requestDateRange: '04/03/2024 - 15/03/2024', numberOfRequests: 1, requestStatus: 'Rejected - Acknowledgement Required' },
        { id: '0289', groupCode: 'Not in Group', studentName: 'Rob Tran',          studentCode: 'AVSTUD003',       studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'Mar Roster',     requestDateRange: '04/03/2024 - 15/03/2024', numberOfRequests: 1, requestStatus: 'Pending'                             },
      ],
    },
    {
      id: 3,
      name: 'Queensland Ambulance Service',
      emailChecked: false,
      partnerChecked: true,
      actionedItems: 2,
      totalItems: 3,
      partner: 'Queensland Health Partners',
      region: 'Metro',
      partnerDiscipline: 'Paramedicine',
      partnerCampus: 'Brisbane Campus',
      partnerAgency: 'QAS',
      requests: [
        { id: '4021', groupCode: 'Not in Group', studentName: 'Anastasia Walters', studentCode: 'PARAMED1A',       studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'March 2025',     requestDateRange: '03/03/2025 - 23/03/2025', numberOfRequests: 1, requestStatus: 'Draft'                              },
        { id: '3839', groupCode: 'Not in Group', studentName: 'Everest Luna',      studentCode: 'PARAMED40A',      studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'March 2025',     requestDateRange: '03/03/2025 - 23/03/2025', numberOfRequests: 1, requestStatus: 'Offer Received'                     },
        { id: '3812', groupCode: 'Not in Group', studentName: 'Cyrus Bonilla',     studentCode: 'PARAMED38A',      studentDetails: '120 Hours On-Road Emergency',  requestedExperience: '120 Hours On-Road Emergency',  requestDateLabel: 'March 2025',     requestDateRange: '03/03/2025 - 23/03/2025', numberOfRequests: 1, requestStatus: 'Rejected - Acknowledgement Required' },
      ],
    },
    {
      id: 4,
      name: 'City Medical Response Unit',
      emailChecked: false,
      partnerChecked: false,
      actionedItems: 0,
      totalItems: 2,
      partner: 'City Health Co.',
      region: 'Metro',
      partnerDiscipline: 'Emergency Medicine',
      partnerCampus: 'CBD Campus',
      partnerAgency: 'City Medical',
      requests: [
        { id: '0401', groupCode: 'Not in Group', studentName: 'Lisa Learad',       studentCode: 'AVSTUU005',       studentDetails: '5 Days On-Road Emergency',     requestedExperience: '5 Days On-Road Emergency',     requestDateLabel: 'Feb Roster',     requestDateRange: '12/02/2024 - 24/02/2024', numberOfRequests: 1, requestStatus: 'Pending' },
        { id: '0402', groupCode: 'Not in Group', studentName: 'Rebeccca Harrison', studentCode: 'AVSTUD017',       studentDetails: '12 Days On-Road Emergency',    requestedExperience: '12 Days On-Road Emergency',    requestDateLabel: 'Feb Roster',     requestDateRange: '12/02/2024 - 24/02/2024', numberOfRequests: 1, requestStatus: 'Draft'   },
      ],
    },
  ];

  // ── Computeds ─────────────────────────────────────────────────────────────
  readonly selectedCount = computed(() => this.selectedAgencies().size);
  readonly allSelected   = computed(
    () => this.agencies.length > 0 && this.selectedAgencies().size === this.agencies.length,
  );

  // ── Row / selection ───────────────────────────────────────────────────────
  toggleRow(id: number): void {
    this.expandedRows.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleAgency(id: number): void {
    this.selectedAgencies.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    this.selectionChanged.emit(this.selectedAgencies().size);
  }

  toggleAllAgencies(): void {
    this.allSelected()
      ? this.selectedAgencies.set(new Set())
      : this.selectedAgencies.set(new Set(this.agencies.map(a => a.id)));
    this.selectionChanged.emit(this.selectedAgencies().size);
  }

  toggleRequest(reqId: string): void {
    this.selectedRequests.update(s => { const n = new Set(s); n.has(reqId) ? n.delete(reqId) : n.add(reqId); return n; });
  }

  // ── Send Request modal ────────────────────────────────────────────────────
  openSendModal(): void {
    this.selectedModalRows.set(new Set());
    this.showSendModal.set(true);
  }

  closeSendModal(): void {
    this.showSendModal.set(false);
    this.showModalBulkDropdown.set(false);
  }

  toggleModalRow(reqId: string): void {
    this.selectedModalRows.update(s => { const n = new Set(s); n.has(reqId) ? n.delete(reqId) : n.add(reqId); return n; });
  }

  toggleAllModalRows(): void {
    this.allModalSelected()
      ? this.selectedModalRows.set(new Set())
      : this.selectedModalRows.set(new Set(this.modalRequests().map(r => r.req.id)));
  }

  getModalPlacementType(reqId: string): string {
    return this.modalRowState()[reqId]?.placementType ?? 'Standard';
  }

  setModalPlacementType(reqId: string, val: string): void {
    this.modalRowState.update(s => ({ ...s, [reqId]: { placementType: val, yearLevel: s[reqId]?.yearLevel ?? 'Year 3' } }));
  }

  getModalYearLevel(reqId: string): string {
    return this.modalRowState()[reqId]?.yearLevel ?? 'Year 3';
  }

  setModalYearLevel(reqId: string, val: string): void {
    this.modalRowState.update(s => ({ ...s, [reqId]: { placementType: s[reqId]?.placementType ?? 'Standard', yearLevel: val } }));
  }

  // ── Agency col-menu ───────────────────────────────────────────────────────
  addAgencyAttrColumn(attr: ErrefAttribute): void {
    if (this.agencyAddedAttrs().length >= this.agencyAttrMax) return;
    this.agencyAddedAttrs.update(list => [...list, attr]);
    this.agencyAttrOrder.update(o => [...o, attr.id]);
    this.agencyErrefQuery.set('');
    this.agencyShowErref.set(false);
    this.agencyAttrSearchQuery.set('');
  }

  removeAgencyAttrColumn(id: string): void {
    this.agencyAddedAttrs.update(list => list.filter(a => a.id !== id));
    this.agencyAttrOrder.update(o => o.filter(k => k !== id));
    this.agencyHiddenAttrs.update(s => { const n = new Set(s); n.delete(id); return n; });
  }

  toggleAgencyAttrColumn(id: string): void {
    this.agencyHiddenAttrs.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleAgencyAttrOptions(id: string): void {
    this.agencyOpenAttrOptId.update(cur => cur === id ? null : id);
    this.agencyShowErref.set(false);
  }

  toggleAgencyErrefSearch(): void {
    this.agencyShowErref.update(v => !v);
    this.agencyOpenAttrOptId.set(null);
    this.agencyErrefQuery.set('');
  }

  moveAgencyAttrUp(id: string): void {
    this.agencyAttrOrder.update(o => {
      const i = o.indexOf(id);
      if (i <= 0) return o;
      const n = [...o]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n;
    });
  }

  moveAgencyAttrDown(id: string): void {
    this.agencyAttrOrder.update(o => {
      const i = o.indexOf(id);
      if (i < 0 || i >= o.length - 1) return o;
      const n = [...o]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n;
    });
  }

  getAgencyAttrValue(agencyName: string, attrId: string): string {
    return this.agencyErrefData[agencyName]?.[attrId] ?? '—';
  }

  // ── Nested col-menu ───────────────────────────────────────────────────────
  toggleNestedCol(key: NestedColKey): void {
    this.nestedColVisibility.update(v => ({ ...v, [key]: !v[key] }));
  }

  addNestedAttrColumn(attr: ErrefAttribute): void {
    if (this.nestedAddedAttrs().length >= this.nestedAttrMax) return;
    this.nestedAddedAttrs.update(list => [...list, attr]);
    this.nestedColumnOrder.update(o => {
      const stdSet = new Set(this.nestedStdKeys as readonly string[]);
      const n = [...o];
      // Insert after 'student' and any custom attrs already clustered there
      const studentPos = n.indexOf('student');
      let insertIdx = studentPos >= 0 ? studentPos + 1 : n.length;
      while (insertIdx < n.length && !stdSet.has(n[insertIdx])) insertIdx++;
      n.splice(insertIdx, 0, attr.id);
      return n;
    });
    this.nestedErrefQuery.set('');
    this.nestedShowErref.set(false);
    this.nestedAttrSearchQuery.set('');
  }

  removeNestedAttrColumn(id: string): void {
    this.nestedAddedAttrs.update(list => list.filter(a => a.id !== id));
    this.nestedColumnOrder.update(o => o.filter(k => k !== id));
    this.nestedHiddenAttrs.update(s => { const n = new Set(s); n.delete(id); return n; });
  }

  toggleNestedAttrColumn(id: string): void {
    this.nestedHiddenAttrs.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  toggleNestedAttrOptions(id: string): void {
    this.nestedOpenAttrOptId.update(cur => cur === id ? null : id);
    this.nestedShowErref.set(false);
  }

  toggleNestedErrefSearch(): void {
    this.nestedShowErref.update(v => !v);
    this.nestedOpenAttrOptId.set(null);
    this.nestedErrefQuery.set('');
  }

  moveNestedColUp(id: string): void {
    this.nestedColumnOrder.update(o => {
      const i = o.indexOf(id);
      if (i <= 0) return o;
      const n = [...o]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; return n;
    });
  }

  moveNestedColDown(id: string): void {
    this.nestedColumnOrder.update(o => {
      const i = o.indexOf(id);
      if (i < 0 || i >= o.length - 1) return o;
      const n = [...o]; [n[i], n[i + 1]] = [n[i + 1], n[i]]; return n;
    });
  }

  getNestedAttrName(attrId: string): string {
    return this.nestedAttrMap().get(attrId)?.name ?? attrId;
  }

  getNestedAttrValue(reqId: string, attrId: string): string {
    return this.nestedErrefData[reqId]?.[attrId] ?? '—';
  }

  readonly agencyColMenuEditItem = signal<{ type: 'attr'; id: string } | null>(null);
  readonly agencyColMenuEditLabel = signal<string>('');
  readonly agencyCustomAttrLabels = signal<Record<string, string>>({});
  readonly agencyColMenuEditAttr = computed(() => {
    const item = this.agencyColMenuEditItem();
    if (!item) return null;
    return this.agencyErrefAttributes.find(a => a.id === item.id) ?? null;
  });
  openAgencyColEdit(id: string): void {
    this.agencyColMenuEditItem.set({ type: 'attr', id });
    this.agencyColMenuEditLabel.set(this.agencyCustomAttrLabels()[id] ?? '');
  }
  closeAgencyColEdit(): void {
    this.agencyColMenuEditItem.set(null);
    this.agencyColMenuEditLabel.set('');
  }
  saveAgencyColEdit(): void {
    const item = this.agencyColMenuEditItem();
    if (!item) return;
    const label = this.agencyColMenuEditLabel().trim();
    this.agencyCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.agencyColMenuEditItem.set(null);
    this.agencyColMenuEditLabel.set('');
  }
  getAgencyAttrLabel(id: string): string {
    const custom = this.agencyCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.agencyErrefAttributes.find(a => a.id === id)?.name ?? id;
  }

  readonly arNestedColMenuEditItem = signal<{ type: 'attr'; id: string } | null>(null);
  readonly arNestedColMenuEditLabel = signal<string>('');
  readonly arNestedCustomAttrLabels = signal<Record<string, string>>({});
  readonly arNestedColMenuEditAttr = computed(() => {
    const item = this.arNestedColMenuEditItem();
    if (!item) return null;
    return this.nestedErrefAttributes.find(a => a.id === item.id) ?? null;
  });
  openArNestedColEdit(id: string): void {
    this.arNestedColMenuEditItem.set({ type: 'attr', id });
    this.arNestedColMenuEditLabel.set(this.arNestedCustomAttrLabels()[id] ?? '');
  }
  closeArNestedColEdit(): void {
    this.arNestedColMenuEditItem.set(null);
    this.arNestedColMenuEditLabel.set('');
  }
  saveArNestedColEdit(): void {
    const item = this.arNestedColMenuEditItem();
    if (!item) return;
    const label = this.arNestedColMenuEditLabel().trim();
    this.arNestedCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.arNestedColMenuEditItem.set(null);
    this.arNestedColMenuEditLabel.set('');
  }
  getArNestedAttrLabel(id: string): string {
    const custom = this.arNestedCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.nestedErrefAttributes.find(a => a.id === id)?.name ?? id;
  }

  // ── Outside-click handler ─────────────────────────────────────────────────
  onDocClick(event: MouseEvent): void {
    const t = event.target as HTMLElement;
    if (!t.closest('.ar-agency-cog-wrapper') && !t.closest('.fp-col-menu')) {
      this.showAgencyColMenu.set(false);
      this.agencyShowErref.set(false);
      this.agencyOpenAttrOptId.set(null);
      this.agencyAttrSearchQuery.set('');
    }
    if (!t.closest('.ar-nested-cog-wrapper') && !t.closest('.fp-col-menu')) {
      this.showNestedColMenu.set(false);
      this.nestedShowErref.set(false);
      this.nestedOpenAttrOptId.set(null);
      this.nestedAttrSearchQuery.set('');
    }
    if (!t.closest('.ar-modal-bulk-wrapper')) {
      this.showModalBulkDropdown.set(false);
    }
  }
}
