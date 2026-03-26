import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

type PrMainStdColKey = 'numberOfRequests' | 'numberOfPlacements';
type PrNestedColKey  = 'groupCode' | 'student' | 'requestedDates' | 'experience' | 'numberOfRequests' | 'offers';

interface ErrefAttribute { id: string; name: string; description?: string; collection: string; }

interface ProcessRequest {
  id: string;
  groupCode: string;
  studentName: string;
  studentCode: string;
  requestedDates: string;
  experience: string;
  numberOfRequests: number;
  offers: number;
  requestStatus: 'Draft' | 'Offer Received' | 'Rejected - Acknowledgement Required' | 'Pending';
}

interface ProcessAgency {
  id: number;
  name: string;
  numberOfRequests: number;
  numberOfPlacements: number;
  status: 'Action Pending' | 'Reviewed' | 'Pending';
  requests: ProcessRequest[];
}

@Component({
  selector: 'app-process-responses',
  imports: [FormsModule],
  templateUrl: './process-responses.html',
  styleUrl: './process-responses.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocClick($event)' },
})
export class ProcessResponsesComponent {

  // ── Row / selection ───────────────────────────────────────────────────────
  readonly expandedRows      = signal<Set<number>>(new Set());
  readonly selectedAgencies  = signal<Set<number>>(new Set());
  readonly selectedRequests  = signal<Set<string>>(new Set());

  readonly allSelected = computed(
    () => this.agencies.length > 0 && this.selectedAgencies().size === this.agencies.length,
  );

  toggleRow(id: number): void {
    this.expandedRows.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  toggleAgency(id: number): void {
    this.selectedAgencies.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  toggleAllAgencies(): void {
    this.allSelected()
      ? this.selectedAgencies.set(new Set())
      : this.selectedAgencies.set(new Set(this.agencies.map(a => a.id)));
  }
  toggleRequest(reqId: string): void {
    this.selectedRequests.update(s => { const n = new Set(s); n.has(reqId) ? n.delete(reqId) : n.add(reqId); return n; });
  }

  // ── Main col-menu (standard toggles + ERREF) ──────────────────────────────
  readonly showMainColMenu = signal(false);

  readonly prMainColDefs: { key: PrMainStdColKey; label: string }[] = [
    { key: 'numberOfRequests',   label: 'No. of Requests'   },
    { key: 'numberOfPlacements', label: 'No. of Placements' },
  ];
  readonly prMainColVis = signal<Record<PrMainStdColKey, boolean>>({
    numberOfRequests: true, numberOfPlacements: true,
  });
  toggleMainCol(key: PrMainStdColKey): void {
    this.prMainColVis.update(v => ({ ...v, [key]: !v[key] }));
  }

  readonly prAgencyAttrMax       = 5;
  readonly prAgencyAddedAttrs    = signal<ErrefAttribute[]>([]);
  readonly prAgencyHiddenAttrs   = signal<Set<string>>(new Set());
  readonly prAgencyAttrOrder     = signal<string[]>([]);
  readonly prAgencyOpenAttrOptId = signal<string | null>(null);
  readonly prAgencyShowErref     = signal(false);
  readonly prAgencyErrefQuery    = signal('');

  readonly prAgencyAttrMap         = computed(() => new Map(this.prAgencyAddedAttrs().map(a => [a.id, a])));
  readonly prAgencyAttrRemaining   = computed(() => this.prAgencyAttrMax - this.prAgencyAddedAttrs().length);
  readonly prAgencyAttrColumnOrder = computed(() =>
    this.prAgencyAttrOrder().map(id => this.prAgencyAttrMap().get(id)).filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly prMainColLimit = 15;
  readonly prMainColInUse = computed(() =>
    3 + this.prMainColDefs.filter(c => this.prMainColVis()[c.key]).length
      + this.prAgencyAttrColumnOrder().filter(a => !this.prAgencyHiddenAttrs().has(a.id)).length
  );
  readonly prMainColAtCapacity = computed(() => this.prMainColInUse() >= this.prMainColLimit);

  readonly prAgencyErrefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_4',  name: 'Ambulance Victoria',            description: 'Metro or Rural classification assigned by Ambulance Victoria.', collection: 'Clinical'   },
    { id: 'ERREF_5',  name: 'NDIS Provider',                 description: 'Indicates whether the agency is a registered NDIS provider.',   collection: 'Global'     },
    { id: 'ERREF_6',  name: 'Partner Agreement',             description: 'Indicates whether a formal partner agreement is in place.',      collection: 'Global'     },
    { id: 'ERREF_7',  name: 'Accreditation Status',          description: 'Current accreditation status of the placement agency.',         collection: 'Global'     },
    { id: 'ERREF_8',  name: 'Capacity (Annual)',              description: 'Maximum number of students the agency can accommodate per year.', collection: 'Clinical'   },
    { id: 'ERREF_9',  name: 'On-Call Availability',          description: 'Whether the agency supports on-call or after-hours placements.', collection: 'Global'     },
    { id: 'ERREF_10', name: 'Rural & Remote Classification', description: 'Indicates if the agency is classified as rural or remote.',      collection: 'Location'   },
    { id: 'ERREF_11', name: 'Supervisor Ratio',              description: 'Supervisor-to-student ratio maintained by the agency.',          collection: 'Clinical'   },
    { id: 'ERREF_12', name: 'Teaching Hospital Affiliation', description: 'Whether the agency has an affiliation with a teaching hospital.', collection: 'Clinical'   },
    { id: 'ERREF_13', name: 'Medicare Provider Number',      description: 'Medicare Provider Number associated with the agency.',           collection: 'Compliance' },
    { id: 'ERREF_14', name: 'International Placements',      description: 'Whether the agency accepts international students.',              collection: 'Location'   },
    { id: 'ERREF_15', name: 'DHS Working With Children',     description: 'Indicates valid Working With Children check is held.',           collection: 'Compliance' },
  ];
  readonly prMainAttrSearchQuery      = signal('');
  readonly prMainSelectedCollection   = signal<string | null>(null);
  readonly prMainAvailExpanded        = signal(true);
  readonly prNestedAttrSearchQuery    = signal('');
  readonly prNestedSelectedCollection = signal<string | null>(null);
  readonly prNestedAvailExpanded      = signal(true);

  readonly prAgencyErrefResults = computed(() => {
    const q = this.prMainAttrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.prAgencyAddedAttrs().map(a => a.id));
    return this.prAgencyErrefAttributes.filter(
      a => !added.has(a.id) && (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly prMainColsAvailable = computed(() =>
    this.prMainColDefs.filter(c => !this.prMainColVis()[c.key])
  );
  readonly prMainAttrsAvailable = computed(() =>
    this.prAgencyAttrColumnOrder().filter(a => this.prAgencyHiddenAttrs().has(a.id))
  );
  readonly prMainAttrCollections = computed(() => {
    const q = this.prMainAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.prAgencyAddedAttrs().map(a => a.id));
    const map = new Map<string, number>();
    for (const a of this.prAgencyErrefAttributes) {
      if (!added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)))
        map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });
  readonly prMainAttrsInCollection = computed(() => {
    const sel = this.prMainSelectedCollection();
    if (!sel) return [] as ErrefAttribute[];
    const q = this.prMainAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.prAgencyAddedAttrs().map(a => a.id));
    return this.prAgencyErrefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });
  readonly prNestedColsAvailable = computed(() =>
    this.prNestedColDefs.filter(c => !this.prNestedColVis()[c.key])
  );
  readonly prNestedAttrsAvailable = computed(() =>
    this.prNestedAttrColumnOrder().filter(a => this.prNestedHiddenAttrs().has(a.id))
  );
  readonly prNestedAttrCollections = computed(() => {
    const q = this.prNestedAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.prNestedAddedAttrs().map(a => a.id));
    const map = new Map<string, number>();
    for (const a of this.prNestedErrefAttributes) {
      if (!added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)))
        map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });
  readonly prNestedAttrsInCollection = computed(() => {
    const sel = this.prNestedSelectedCollection();
    if (!sel) return [] as ErrefAttribute[];
    const q = this.prNestedAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.prNestedAddedAttrs().map(a => a.id));
    return this.prNestedErrefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });
  readonly prAgencyErrefData: Record<string, Record<string, string>> = {
    'Queensland Ambulance Service': { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'Royal Ambulance Victoria':     { ERREF_4: 'Rural', ERREF_5: 'No',  ERREF_6: 'Yes' },
    'Melbourne Emergency Services': { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'No'  },
  };

  addAgencyAttrColumn(attr: ErrefAttribute): void {
    if (this.prAgencyAddedAttrs().length >= this.prAgencyAttrMax) return;
    this.prAgencyAddedAttrs.update(l => [...l, attr]);
    this.prAgencyAttrOrder.update(o => [...o, attr.id]);
    this.prMainAttrSearchQuery.set('');
  }
  removeAgencyAttrColumn(id: string): void {
    this.prAgencyAddedAttrs.update(l => l.filter(a => a.id !== id));
    this.prAgencyAttrOrder.update(o => o.filter(k => k !== id));
    this.prAgencyHiddenAttrs.update(s => { const n = new Set(s); n.delete(id); return n; });
  }
  toggleAgencyAttrColumn(id: string): void {
    this.prAgencyHiddenAttrs.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  toggleAgencyAttrOptions(id: string): void {
    this.prAgencyOpenAttrOptId.update(c => c === id ? null : id);
    this.prAgencyShowErref.set(false);
  }
  toggleAgencyErrefSearch(): void {
    this.prAgencyShowErref.update(v => !v);
    this.prAgencyOpenAttrOptId.set(null);
    this.prAgencyErrefQuery.set('');
  }
  moveAgencyAttrUp(id: string): void {
    this.prAgencyAttrOrder.update(o => { const i = o.indexOf(id); if (i <= 0) return o; const n = [...o]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n; });
  }
  moveAgencyAttrDown(id: string): void {
    this.prAgencyAttrOrder.update(o => { const i = o.indexOf(id); if (i < 0 || i >= o.length-1) return o; const n = [...o]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n; });
  }
  getAgencyAttrValue(agencyName: string, attrId: string): string {
    return this.prAgencyErrefData[agencyName]?.[attrId] ?? '—';
  }

  // ── Nested col-menu ───────────────────────────────────────────────────────
  private readonly prNestedStdKeys = ['groupCode', 'student', 'requestedDates', 'experience', 'numberOfRequests', 'offers'] as const;

  readonly prNestedColDefs: { key: PrNestedColKey; label: string }[] = [
    { key: 'groupCode',        label: 'Group Code'       },
    { key: 'student',          label: 'Student'          },
    { key: 'requestedDates',   label: 'Requested Dates'  },
    { key: 'experience',       label: 'Experience'       },
    { key: 'numberOfRequests', label: 'No. of Requests'  },
    { key: 'offers',           label: 'Offers'           },
  ];
  readonly prNestedColVis = signal<Record<PrNestedColKey, boolean>>({
    groupCode: true, student: true, requestedDates: true,
    experience: true, numberOfRequests: true, offers: true,
  });
  toggleNestedCol(key: PrNestedColKey): void {
    this.prNestedColVis.update(v => ({ ...v, [key]: !v[key] }));
  }

  readonly showNestedColMenu     = signal(false);
  readonly prNestedAttrMax       = 5;
  readonly prNestedAddedAttrs    = signal<ErrefAttribute[]>([]);
  readonly prNestedHiddenAttrs   = signal<Set<string>>(new Set());
  readonly prNestedColumnOrder   = signal<string[]>([
    'groupCode', 'student', 'requestedDates', 'experience', 'numberOfRequests', 'offers',
  ]);
  readonly prNestedOpenAttrOptId = signal<string | null>(null);
  readonly prNestedShowErref     = signal(false);
  readonly prNestedErrefQuery    = signal('');

  readonly prNestedAttrMap         = computed(() => new Map(this.prNestedAddedAttrs().map(a => [a.id, a])));
  readonly prNestedAttrRemaining   = computed(() => this.prNestedAttrMax - this.prNestedAddedAttrs().length);
  readonly prNestedAttrColumnOrder = computed(() =>
    this.prNestedColumnOrder()
      .filter(k => !(this.prNestedStdKeys as readonly string[]).includes(k))
      .map(id => this.prNestedAttrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly prNestedColLimit = 15;
  readonly prNestedColInUse = computed(() =>
    4 + this.prNestedColDefs.filter(c => this.prNestedColVis()[c.key]).length
      + this.prNestedAttrColumnOrder().filter(a => !this.prNestedHiddenAttrs().has(a.id)).length
  );
  readonly prNestedColAtCapacity = computed(() => this.prNestedColInUse() >= this.prNestedColLimit);

  readonly prNestedErrefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_1',  name: 'Aboriginal/Torres Strait',                   description: 'Indicates whether the student identifies as Aboriginal or Torres Strait Islander.',    collection: 'Global'       },
    { id: 'ERREF_2',  name: 'Acknowledgement Availability for Placement', description: 'Confirms the student has acknowledged their availability for this placement block.',    collection: 'Compliance'   },
    { id: 'ERREF_3',  name: 'Ambulance Orientation',                      description: 'Records whether the student has completed the required ambulance orientation session.', collection: 'Allied Health' },
    { id: 'ERREF_17', name: 'Disability Support Plan',                    description: 'Indicates whether the student has an active disability support plan.',                  collection: 'Global'       },
    { id: 'ERREF_18', name: 'Driver Licence',                             description: 'Whether the student holds a valid driver licence.',                                      collection: 'Compliance'   },
    { id: 'ERREF_19', name: 'First Aid Certificate',                      description: 'Whether the student holds a current first aid certificate.',                             collection: 'Allied Health' },
    { id: 'ERREF_20', name: 'Flu Vaccination',                            description: 'Whether the student has received the current season flu vaccination.',                   collection: 'Allied Health' },
    { id: 'ERREF_21', name: 'Hepatitis B Vaccination',                    description: 'Whether the student has completed the Hepatitis B vaccination course.',                  collection: 'Allied Health' },
    { id: 'ERREF_22', name: 'International Student',                      description: 'Indicates whether the student is an international student.',                             collection: 'Global'       },
    { id: 'ERREF_23', name: 'Police Check Expiry',                        description: 'Expiry date of the student police check clearance.',                                     collection: 'Compliance'   },
    { id: 'ERREF_24', name: 'Student Equity Scholarship',                 description: 'Whether the student is currently receiving an equity scholarship.',                      collection: 'Global'       },
    { id: 'ERREF_25', name: 'CPR Certification',                          description: 'Whether the student holds a current CPR certification.',                                 collection: 'Allied Health' },
  ];
  readonly prNestedErrefResults = computed(() => {
    const q = this.prNestedAttrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.prNestedAddedAttrs().map(a => a.id));
    return this.prNestedErrefAttributes.filter(
      a => !added.has(a.id) && (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });
  readonly prNestedErrefData: Record<string, Record<string, string>> = {
    '4021': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
    '3839': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '3812': { ERREF_1: 'Yes', ERREF_2: 'No',  ERREF_3: 'Yes' },
    '3811': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '3810': { ERREF_1: 'No',  ERREF_2: 'No',  ERREF_3: 'Yes' },
    '3809': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
    '3808': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'No'  },
    '0287': { ERREF_1: 'Yes', ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '0288': { ERREF_1: 'No',  ERREF_2: 'No',  ERREF_3: 'Yes' },
    '0289': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '0315': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    '0316': { ERREF_1: 'No',  ERREF_2: 'Yes', ERREF_3: 'Yes' },
  };

  addNestedAttrColumn(attr: ErrefAttribute): void {
    if (this.prNestedAddedAttrs().length >= this.prNestedAttrMax) return;
    this.prNestedAddedAttrs.update(l => [...l, attr]);
    this.prNestedColumnOrder.update(o => {
      const stdSet = new Set(this.prNestedStdKeys as readonly string[]);
      const n = [...o];
      const studentPos = n.indexOf('student');
      let insertIdx = studentPos >= 0 ? studentPos + 1 : n.length;
      while (insertIdx < n.length && !stdSet.has(n[insertIdx])) insertIdx++;
      n.splice(insertIdx, 0, attr.id);
      return n;
    });
    this.prNestedAttrSearchQuery.set('');
  }
  removeNestedAttrColumn(id: string): void {
    this.prNestedAddedAttrs.update(l => l.filter(a => a.id !== id));
    this.prNestedColumnOrder.update(o => o.filter(k => k !== id));
    this.prNestedHiddenAttrs.update(s => { const n = new Set(s); n.delete(id); return n; });
  }
  toggleNestedAttrColumn(id: string): void {
    this.prNestedHiddenAttrs.update(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  toggleNestedAttrOptions(id: string): void {
    this.prNestedOpenAttrOptId.update(c => c === id ? null : id);
    this.prNestedShowErref.set(false);
  }
  toggleNestedErrefSearch(): void {
    this.prNestedShowErref.update(v => !v);
    this.prNestedOpenAttrOptId.set(null);
    this.prNestedErrefQuery.set('');
  }
  moveNestedAttrUp(id: string): void {
    this.prNestedColumnOrder.update(o => { const i = o.indexOf(id); if (i <= 0) return o; const n = [...o]; [n[i-1], n[i]] = [n[i], n[i-1]]; return n; });
  }
  moveNestedAttrDown(id: string): void {
    this.prNestedColumnOrder.update(o => { const i = o.indexOf(id); if (i < 0 || i >= o.length-1) return o; const n = [...o]; [n[i], n[i+1]] = [n[i+1], n[i]]; return n; });
  }
  getNestedAttrName(attrId: string): string { return this.prNestedAttrMap().get(attrId)?.name ?? attrId; }
  getNestedAttrValue(reqId: string, attrId: string): string { return this.prNestedErrefData[reqId]?.[attrId] ?? '—'; }

  readonly prMainColMenuEditItem = signal<{ type: 'attr'; id: string } | null>(null);
  readonly prMainColMenuEditLabel = signal<string>('');
  readonly prMainCustomAttrLabels = signal<Record<string, string>>({});
  readonly prMainColMenuEditAttr = computed(() => {
    const item = this.prMainColMenuEditItem();
    if (!item) return null;
    return this.prAgencyErrefAttributes.find(a => a.id === item.id) ?? null;
  });
  openPrMainColEdit(id: string): void {
    this.prMainColMenuEditItem.set({ type: 'attr', id });
    this.prMainColMenuEditLabel.set(this.prMainCustomAttrLabels()[id] ?? '');
  }
  closePrMainColEdit(): void {
    this.prMainColMenuEditItem.set(null);
    this.prMainColMenuEditLabel.set('');
  }
  savePrMainColEdit(): void {
    const item = this.prMainColMenuEditItem();
    if (!item) return;
    const label = this.prMainColMenuEditLabel().trim();
    this.prMainCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.prMainColMenuEditItem.set(null);
    this.prMainColMenuEditLabel.set('');
  }
  getPrMainAttrLabel(id: string): string {
    const custom = this.prMainCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.prAgencyErrefAttributes.find(a => a.id === id)?.name ?? id;
  }

  readonly prNestedColMenuEditItem = signal<{ type: 'attr'; id: string } | null>(null);
  readonly prNestedColMenuEditLabel = signal<string>('');
  readonly prNestedCustomAttrLabels = signal<Record<string, string>>({});
  readonly prNestedColMenuEditAttr = computed(() => {
    const item = this.prNestedColMenuEditItem();
    if (!item) return null;
    return this.prNestedErrefAttributes.find(a => a.id === item.id) ?? null;
  });
  openPrNestedColEdit(id: string): void {
    this.prNestedColMenuEditItem.set({ type: 'attr', id });
    this.prNestedColMenuEditLabel.set(this.prNestedCustomAttrLabels()[id] ?? '');
  }
  closePrNestedColEdit(): void {
    this.prNestedColMenuEditItem.set(null);
    this.prNestedColMenuEditLabel.set('');
  }
  savePrNestedColEdit(): void {
    const item = this.prNestedColMenuEditItem();
    if (!item) return;
    const label = this.prNestedColMenuEditLabel().trim();
    this.prNestedCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.prNestedColMenuEditItem.set(null);
    this.prNestedColMenuEditLabel.set('');
  }
  getPrNestedAttrLabel(id: string): string {
    const custom = this.prNestedCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.prNestedErrefAttributes.find(a => a.id === id)?.name ?? id;
  }

  // ── Action dropdown ───────────────────────────────────────────────────────
  readonly prShowActionMenu = signal<string | null>(null);
  toggleActionMenu(reqId: string): void {
    this.prShowActionMenu.update(c => c === reqId ? null : reqId);
  }

  // ── Mock data ─────────────────────────────────────────────────────────────
  readonly agencies: ProcessAgency[] = [
    {
      id: 0, name: 'Queensland Ambulance Service', numberOfRequests: 32, numberOfPlacements: 5, status: 'Action Pending',
      requests: [
        { id: '4021', groupCode: 'Not in Group', studentName: 'Anastasia Walters', studentCode: 'PARAMED1A',  requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Draft'                              },
        { id: '3839', groupCode: 'Not in Group', studentName: 'Everest Luna',      studentCode: 'PARAMED40A', requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Offer Received'                     },
        { id: '3812', groupCode: 'Not in Group', studentName: 'Cyrus Bonilla',     studentCode: 'PARAMED38A', requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Rejected - Acknowledgement Required' },
        { id: '3811', groupCode: 'Not in Group', studentName: 'Zola Lyons',        studentCode: 'PARAMED37A', requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Rejected - Acknowledgement Required' },
        { id: '3810', groupCode: 'Not in Group', studentName: 'Lilliana Madden',   studentCode: 'PARAMED21A', requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Rejected - Acknowledgement Required' },
        { id: '3809', groupCode: 'Not in Group', studentName: 'Kairi Owen',        studentCode: 'PARAMED21A', requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Rejected - Acknowledgement Required' },
        { id: '3808', groupCode: 'Not in Group', studentName: 'John Shah',         studentCode: 'PARAMED14A', requestedDates: '03/03/2025 - 23/03/2025', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Pending'                             },
      ],
    },
    {
      id: 1, name: 'Royal Ambulance Victoria', numberOfRequests: 15, numberOfPlacements: 3, status: 'Reviewed',
      requests: [
        { id: '0287', groupCode: 'Not in Group', studentName: 'Clark Larkin',   studentCode: 'AVSTUQ016', requestedDates: '04/03/2024 - 15/03/2024', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 1, requestStatus: 'Offer Received'                     },
        { id: '0288', groupCode: 'Not in Group', studentName: 'Debra Trimeles', studentCode: 'AVSTUD902', requestedDates: '04/03/2024 - 15/03/2024', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Rejected - Acknowledgement Required' },
        { id: '0289', groupCode: 'Not in Group', studentName: 'Rob Tran',       studentCode: 'AVSTUD003', requestedDates: '04/03/2024 - 15/03/2024', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Pending'                             },
      ],
    },
    {
      id: 2, name: 'Melbourne Emergency Services', numberOfRequests: 8, numberOfPlacements: 0, status: 'Pending',
      requests: [
        { id: '0315', groupCode: 'Not in Group', studentName: 'Ben Trinh',     studentCode: 'AVSTTU0015', requestedDates: '12/02/2024 - 24/02/2024', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 0, requestStatus: 'Draft'          },
        { id: '0316', groupCode: 'Not in Group', studentName: 'Chris Krejcie', studentCode: 'AVSTTU0024', requestedDates: '12/02/2024 - 24/02/2024', experience: '120 Hours On-Road Emergency', numberOfRequests: 1, offers: 1, requestStatus: 'Offer Received' },
      ],
    },
  ];

  // ── Outside-click handler ─────────────────────────────────────────────────
  onDocClick(event: MouseEvent): void {
    const t = event.target as HTMLElement;
    if (!t.closest('.pr-main-cog-area') && !t.closest('.fp-col-menu')) {
      this.showMainColMenu.set(false);
      this.prMainAttrSearchQuery.set('');
    }
    if (!t.closest('.pr-nested-cog-wrapper') && !t.closest('.fp-col-menu')) {
      this.showNestedColMenu.set(false);
      this.prNestedAttrSearchQuery.set('');
    }
    if (!t.closest('.pr-action-wrapper')) {
      this.prShowActionMenu.set(null);
    }
  }
}
