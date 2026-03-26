import { ChangeDetectionStrategy, Component, WritableSignal, computed, effect, signal, viewChild } from '@angular/core';

type ColVisibility = { placementBlock: boolean; specialism: boolean; location: boolean; requestQueue: boolean; draftRequest: boolean; sent: boolean; agenciesRequested: boolean };
type NestedColKey = 'specialism' | 'ranking' | 'location';

interface ErrefAttribute { id: string; name: string; description?: string; collection: string; }

type AttrEditType = 'multiselect' | 'select' | 'boolean' | 'date' | 'text';
interface AttributeItem {
  name: string;
  description: string;
  editType: AttrEditType;
  options?: string[];
  selectedOptions?: string[];
  value: string;
  expiryEnabled: boolean;
  expiry: string;
  refNoEnabled: boolean;
  refNo: string;
  attachmentEnabled: boolean;
  attachmentFile: string;
  comment?: string;
  commentEnabled?: boolean;
  infoIcon?: boolean;
}
interface AttributeSubCollection { label: string; items: AttributeItem[]; }
interface AttributeCollection { name: string; requiredCount: number; subCollections: AttributeSubCollection[]; }

interface NoteItem { id: number; noteType: string; title: string; text: string; reminder: string; keepPrivate: boolean; changedByUser: string; createdDate: string; }
interface DocumentItem { id: number; title: string; description: string; fileName: string; }

import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../header/header';
import { PlacementChartComponent } from '../placement-chart/placement-chart';
import { PlacementBlocksComponent } from '../placement-blocks/placement-blocks';
import { RequestSummaryComponent } from '../request-summary/request-summary';
import { RequestDetailsComponent } from '../request-details/request-details';
import { MatchBreakdownComponent } from '../match-breakdown/match-breakdown';
import { TrialMatchSheetComponent } from '../trial-match-sheet/trial-match-sheet';
import { AddAgencySheetComponent } from '../add-agency-sheet/add-agency-sheet';
import { BulkAddAgencySheetComponent } from '../bulk-add-agency-sheet/bulk-add-agency-sheet';
import { ActionRequestsComponent } from '../action-requests/action-requests';
import { ProcessResponsesComponent } from '../process-responses/process-responses';
import { Student } from '../models';

@Component({
  selector: 'app-request-manager',
  imports: [
    FormsModule,
    HeaderComponent,
    PlacementChartComponent,
    PlacementBlocksComponent,
    RequestSummaryComponent,
    RequestDetailsComponent,
    MatchBreakdownComponent,
    TrialMatchSheetComponent,
    AddAgencySheetComponent,
    BulkAddAgencySheetComponent,
    ActionRequestsComponent,
    ProcessResponsesComponent,
  ],
  templateUrl: './request-manager.html',
  styleUrl: './request-manager.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class RequestManagerComponent {
  constructor() {
    effect(() => {
      document.body.style.overflow = this.showCreateRequestSheet() ? 'hidden' : '';
    });
  }

  readonly arComp              = viewChild(ActionRequestsComponent);
  readonly sendTabSelectedCount = signal(0);

  readonly activeTab = signal<'allocation' | 'plan' | 'send' | 'process'>('plan');
  readonly expandedRows = signal<Set<number>>(new Set());
  readonly selectedStudents = signal<Set<number>>(new Set());
  readonly showCreateRequestSheet  = signal(false);
  readonly showMatchBreakdown       = signal(false);
  readonly showBulkActionDropdown   = signal(false);
  readonly showTrialMatchSheet      = signal(false);
  readonly showAddAgencySheet       = signal(false);
  readonly showBulkAddAgencySheet   = signal(false);
  readonly activeStudent            = signal<Student | null>(null);
  readonly displayFullyPlaced     = signal(false);
  readonly showTrialMatchHelper   = signal(true);
  readonly bulkSummaryExpanded    = signal(false);
  readonly showColumnMenu         = signal(false);
  readonly colMenuQuery           = signal('');
  readonly colMenuAvailExpanded   = signal(true);
  readonly eyeHiddenCols          = signal<Set<keyof ColVisibility>>(new Set());
  readonly attrSearchQuery           = signal('');
  readonly colMenuSelectedCollection = signal<string | null>(null);
  readonly colMenuEditItem        = signal<{ type: 'std'; key: keyof ColVisibility } | { type: 'attr'; id: string } | null>(null);
  readonly colMenuEditLabel       = signal('');
  readonly colMenuEditDesc        = signal('');
  readonly customColLabels        = signal<Partial<Record<keyof ColVisibility, string>>>({});
  readonly customAttrLabels       = signal<Record<string, string>>({});
  readonly openActionRowIndex     = signal<number | null>(null);
  readonly openNestedActionKey    = signal<string | null>(null);
  readonly showNestedColMenu       = signal(false);
  readonly openNestedAttrOptionsId = signal<string | null>(null);
  readonly nestedColVisibility     = signal<Record<NestedColKey, boolean>>({
    specialism: true, ranking: true, location: true,
  });

  readonly nestedColDefs: Array<{ key: NestedColKey; label: string }> = [
    { key: 'specialism', label: 'Specialism' },
    { key: 'ranking',    label: 'Ranking'    },
    { key: 'location',   label: 'Location'   },
  ];

  /** Unified ordered list of all moveable column keys (standard + custom attr IDs). */
  readonly nestedColumnOrder = signal<string[]>(['specialism', 'ranking', 'location']);

  readonly nestedAttrMax = 5;
  readonly nestedAttrRemaining = computed(() => this.nestedAttrMax - this.addedNestedAttrColumns().length);

  /** Map from attr id → ErrefAttribute for fast lookup in templates. */
  readonly addedNestedAttrMap = computed(() =>
    new Map(this.addedNestedAttrColumns().map(a => [a.id, a])),
  );

  /** Custom attrs in their current column order position. */
  readonly nestedAttrColumnOrder = computed(() =>
    this.nestedColumnOrder()
      .filter(k => !['specialism', 'ranking', 'location'].includes(k))
      .map(id => this.addedNestedAttrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly nestedErrefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_4',  name: 'Ambulance Victoria',            description: 'Metro or Rural classification assigned by Ambulance Victoria for this agency', collection: 'Clinical'    },
    { id: 'ERREF_5',  name: 'NDIS Provider',                 description: 'Indicates whether the agency is a registered NDIS provider',                  collection: 'Global'     },
    { id: 'ERREF_6',  name: 'Partner Agreement',             description: 'Indicates whether a formal partner agreement is in place with this agency',    collection: 'Global'     },
    { id: 'ERREF_7',  name: 'Accreditation Status',          description: 'Current accreditation status of the placement agency',                         collection: 'Global'     },
    { id: 'ERREF_8',  name: 'Capacity (Annual)',              description: 'Maximum number of students the agency can accommodate per year',               collection: 'Clinical'    },
    { id: 'ERREF_9',  name: 'On-Call Availability',          description: 'Whether the agency supports on-call or after-hours placements',                collection: 'Global'     },
    { id: 'ERREF_10', name: 'Rural & Remote Classification', description: 'Indicates if the agency is classified as rural or remote',                     collection: 'Location'   },
    { id: 'ERREF_11', name: 'Supervisor Ratio',              description: 'Supervisor-to-student ratio maintained by the agency',                         collection: 'Clinical'    },
    { id: 'ERREF_12', name: 'Teaching Hospital Affiliation', description: 'Whether the agency has an affiliation with a teaching hospital',               collection: 'Clinical'    },
    { id: 'ERREF_13', name: 'Medicare Provider Number',      description: 'Medicare Provider Number associated with the agency',                          collection: 'Compliance' },
  ];

  readonly nestedErrefSearchQuery  = signal('');
  readonly showNestedErrefSearch   = signal(false);
  readonly addedNestedAttrColumns  = signal<ErrefAttribute[]>([]);
  readonly hiddenNestedAttrColumns = signal<Set<string>>(new Set());

  readonly nestedAttrSearchQuery     = signal('');
  readonly nestedSelectedCollection  = signal<string | null>(null);
  readonly nestedAvailExpanded       = signal(true);

  readonly nestedColLimit = 15;
  readonly nestedPlanColInUse = computed(() =>
    3 + this.nestedColDefs.filter(c => this.nestedColVisibility()[c.key]).length
      + this.nestedAttrColumnOrder().filter(a => !this.hiddenNestedAttrColumns().has(a.id)).length
  );
  readonly nestedColAtCapacity = computed(() => this.nestedPlanColInUse() >= this.nestedColLimit);

  readonly nestedColsAvailable = computed(() =>
    this.nestedColDefs.filter(c => !this.nestedColVisibility()[c.key])
  );
  readonly nestedAttrsAvailable = computed(() =>
    this.nestedAttrColumnOrder().filter(a => this.hiddenNestedAttrColumns().has(a.id))
  );

  readonly nestedErrefSearchResults = computed(() => {
    const q = this.nestedAttrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.addedNestedAttrColumns().map(a => a.id));
    return this.nestedErrefAttributes.filter(
      a => !added.has(a.id) && (a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
    );
  });
  readonly nestedAttrCollections = computed(() => {
    const q = this.nestedAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.addedNestedAttrColumns().map(a => a.id));
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
    const added = new Set(this.addedNestedAttrColumns().map(a => a.id));
    return this.nestedErrefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });

  readonly nestedErrefAgencyData: Record<string, Record<string, string>> = {
    'Melbourne Emergency Services':     { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'Royal Ambulance Victoria':         { ERREF_4: 'Rural', ERREF_5: '',    ERREF_6: 'Yes' },
    'Metropolitan Health Network':      { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: ''    },
    'City Medical Response Unit':       { ERREF_4: 'Rural', ERREF_5: '',    ERREF_6: ''    },
    'South Eastern Paramedic Services': { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
  };

  readonly errefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_1',  name: 'Aboriginal/Torres Strait',                   description: 'Indicates whether the student identifies as Aboriginal or Torres Strait Islander',     collection: 'Global'      },
    { id: 'ERREF_2',  name: 'Acknowledgement Availability for Placement', description: 'Confirms the student has acknowledged their availability for this placement block',     collection: 'Compliance'  },
    { id: 'ERREF_3',  name: 'Ambulance Orientation',                      description: 'Records whether the student has completed the required ambulance orientation session',  collection: 'Allied Health' },
    { id: 'ERREF_17', name: 'Disability Support Plan',                    description: 'Indicates whether the student has an active disability support plan',                   collection: 'Global'      },
    { id: 'ERREF_18', name: 'Driver Licence',                             description: 'Whether the student holds a valid driver licence',                                       collection: 'Compliance'  },
    { id: 'ERREF_19', name: 'First Aid Certificate',                      description: 'Whether the student holds a current first aid certificate',                              collection: 'Allied Health' },
    { id: 'ERREF_20', name: 'Flu Vaccination',                            description: 'Whether the student has received the current season flu vaccination',                    collection: 'Allied Health' },
    { id: 'ERREF_21', name: 'Hepatitis B Vaccination',                    description: 'Whether the student has completed the Hepatitis B vaccination course',                   collection: 'Allied Health' },
    { id: 'ERREF_22', name: 'International Student',                      description: 'Indicates whether the student is an international student',                              collection: 'Global'      },
    { id: 'ERREF_23', name: 'Police Check Expiry',                        description: 'Expiry date of the student police check clearance',                                      collection: 'Compliance'  },
    { id: 'ERREF_24', name: 'Student Equity Scholarship',                 description: 'Whether the student is currently receiving an equity scholarship',                       collection: 'Global'      },
    { id: 'ERREF_25', name: 'CPR Certification',                          description: 'Whether the student holds a current CPR certification',                                  collection: 'Allied Health' },
    { id: 'ERREF_26', name: 'Language Background Other Than English',     description: 'Indicates if the student has a language background other than English',                  collection: 'Global'      },
  ];

  readonly attrMax = 5;
  readonly attrRemaining = computed(() => this.attrMax - this.addedAttrColumns().length);

  readonly openAttrOptionsId = signal<string | null>(null);

  /** Standard col keys in display order — custom attr ids are appended after these. */
  private readonly stdColKeys = ['placementBlock','specialism','location','requestQueue','draftRequest','sent','agenciesRequested'] as const;

  /** Unified ordered list: standard col keys + custom attr ids. */
  readonly columnOrder = signal<string[]>([...this.stdColKeys]);

  /** Fast lookup map for added student attr columns. */
  readonly attrMap = computed(() => new Map(this.addedAttrColumns().map(a => [a.id, a])));

  /** Custom attrs in their current column-order position (for col-menu display). */
  readonly attrColumnOrder = computed(() =>
    this.columnOrder()
      .filter(k => !(this.stdColKeys as readonly string[]).includes(k))
      .map(id => this.attrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  /** Mock per-student attribute values. Blank means no value to display. */
  readonly errefStudentData: Record<string, Record<string, string>> = {
    'Ben Trinh (AVSTTU0015)':                   { ERREF_1: 'Yes',                  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    'Chris Krejcie (AVSTTU0024)':               { ERREF_1: '',                     ERREF_2: 'Yes', ERREF_3: ''    },
    'Clark Larkin (AVSTUQ016)':                 { ERREF_1: 'No',                   ERREF_2: '',    ERREF_3: 'Yes' },
    'Debra Trimeles (AVSTUD902)':               { ERREF_1: 'Prefer not to answer', ERREF_2: 'Yes', ERREF_3: ''    },
    'Hannah Torin (AVSTUU007)':                 { ERREF_1: '',                     ERREF_2: '',    ERREF_3: 'Yes' },
    'Lisa Learad (AVSTUU005)':                  { ERREF_1: 'Yes',                  ERREF_2: '',    ERREF_3: ''    },
    'Phillip Parker (AVSTUQ020)':               { ERREF_1: 'No',                   ERREF_2: 'Yes', ERREF_3: 'Yes' },
    'Rebeccca Harrison (AVSTUD017)':            { ERREF_1: 'Prefer not to answer', ERREF_2: '',    ERREF_3: ''    },
    'Rob Tran (AVSTUD003)':                     { ERREF_1: '',                     ERREF_2: 'Yes', ERREF_3: 'Yes' },
    'Victor Torin (AVSTUD013)':                 { ERREF_1: 'Yes',                  ERREF_2: '',    ERREF_3: ''    },
    'Yanessa Trimeles (AVSTUD014)':             { ERREF_1: 'No',                   ERREF_2: 'Yes', ERREF_3: ''    },
    'Emma Wilson (AVSTTU025)':                  { ERREF_1: 'Prefer not to answer', ERREF_2: '',    ERREF_3: 'Yes' },
    'James Mitchell (AVSTTU026)':               { ERREF_1: '',                     ERREF_2: 'Yes', ERREF_3: ''    },
    // Placement Block Allocation students
    'Carolee Wagner (WAG19779494_JJA)':         { ERREF_1: 'Yes',                  ERREF_2: 'Yes', ERREF_3: 'Yes' },
    'Edgar Abbott (ABB19780311_JJA)':           { ERREF_1: 'No',                   ERREF_2: '',    ERREF_3: 'Yes' },
    'Erin Crotty (CRO19779521_JJA)':            { ERREF_1: 'Prefer not to answer', ERREF_2: 'Yes', ERREF_3: ''    },
    'Florence Dilly (DIL19779594_JJA)':         { ERREF_1: '',                     ERREF_2: 'Yes', ERREF_3: 'Yes' },
  };

  getErrefValue(studentName: string, errefId: string): string {
    return this.errefStudentData[studentName]?.[errefId] ?? '';
  }
  readonly errefSearchQuery  = signal('');
  readonly showErrefSearch   = signal(false);
  readonly addedAttrColumns  = signal<ErrefAttribute[]>([]);
  readonly hiddenAttrColumns = signal<Set<string>>(new Set());

  readonly fieldsInView = computed(() => {
    const q   = this.colMenuQuery().toLowerCase().trim();
    const vis = this.columnVisibility();
    return this.columnDefs.filter(c => vis[c.key] && (!q || c.label.toLowerCase().includes(q)));
  });
  readonly fieldsAvailable = computed(() => {
    const q   = this.colMenuQuery().toLowerCase().trim();
    const vis = this.columnVisibility();
    return this.columnDefs.filter(c => !vis[c.key] && (!q || c.label.toLowerCase().includes(q)));
  });
  readonly colMenuAttrsInView = computed(() => {
    const q = this.colMenuQuery().toLowerCase().trim();
    return this.attrColumnOrder().filter(
      a => !this.hiddenAttrColumns().has(a.id) && (!q || a.name.toLowerCase().includes(q)),
    );
  });
  readonly colMenuAttrsAvailable = computed(() => {
    const q = this.colMenuQuery().toLowerCase().trim();
    return this.attrColumnOrder().filter(
      a => this.hiddenAttrColumns().has(a.id) && (!q || a.name.toLowerCase().includes(q)),
    );
  });
  /** Max columns in the table including fixed Action + Student columns. */
  readonly colLimit = 15;

  /** Count of all columns currently in the table: locked Student(1) + Action(1) + Checkbox(1) + toggled-on configurable. */
  readonly colInUse = computed(() =>
    3 + this.fieldsInView().length + this.colMenuAttrsInView().length,
  );

  /** True when the user has reached the 15-column limit. */
  readonly colAtCapacity = computed(() => this.colInUse() >= this.colLimit);

  /** The ErrefAttribute being edited in the plan col-menu edit panel (attr type only). */
  readonly colMenuEditAttr = computed(() => {
    const item = this.colMenuEditItem();
    if (!item || item.type !== 'attr') return null;
    return this.errefAttributes.find(a => a.id === item.id) ?? null;
  });

  /** Unadded ERREF attrs matching the bottom attr search query — shown as addable cards. */
  readonly colMenuAttrsUnadded = computed(() => {
    const q = this.attrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.addedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(
      a => !added.has(a.id) && (a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });
  readonly colMenuAttrCollections = computed(() => {
    const q = this.attrSearchQuery().toLowerCase().trim();
    const added = new Set(this.addedAttrColumns().map(a => a.id));
    const map = new Map<string, number>();
    for (const a of this.errefAttributes) {
      if (!added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)))
        map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });
  readonly colMenuAttrsInCollection = computed(() => {
    const sel = this.colMenuSelectedCollection();
    if (!sel) return [] as ErrefAttribute[];
    const q = this.attrSearchQuery().toLowerCase().trim();
    const added = new Set(this.addedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });

  readonly errefSearchResults = computed(() => {
    const q = this.errefSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.addedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(
      a => !added.has(a.id) && (a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
    );
  });
  readonly selectedRanking = signal(95);
  readonly selectedAgencyName = signal('');
  readonly selectedStudentName = signal('');
  readonly requestSummaryExpanded = signal(false);
  readonly expandedBlockGroups = signal(new Set<string>());

  // Attributes section
  readonly showAttributesSection    = signal(false);
  readonly collapseAllAttrs         = signal(false);
  readonly collapsedAttrCollections = signal<Set<string>>(new Set());
  readonly attributeCollections = signal<AttributeCollection[]>([
    {
      name: 'Request Collection',
      requiredCount: 1,
      subCollections: [{
        label: 'Request Sub Collection',
        items: [
          {
            name: 'Request List',
            description: 'Select the status categories for this placement request',
            editType: 'multiselect',
            options: ['Current', 'Existing', 'Offered', 'Completed', 'Placed'],
            selectedOptions: ['Current', 'Existing'],
            value: 'Current, Existing',
            expiryEnabled: false, expiry: '',
            refNoEnabled: false, refNo: '',
            attachmentEnabled: false, attachmentFile: '',
            commentEnabled: true, comment: 'Current placements only for emergency intake',
          },
          {
            name: 'Placement Supervision Type',
            description: 'Specify whether supervision is direct or indirect',
            editType: 'select',
            options: ['Direct', 'Indirect'],
            value: 'Direct',
            expiryEnabled: true, expiry: '',
            refNoEnabled: false, refNo: '',
            attachmentEnabled: true, attachmentFile: '',
          },
          {
            name: 'Requested Placement Type',
            description: 'Enter the specific type of placement setting required',
            editType: 'select',
            options: ['Emergency Care', 'Critical Care', 'Intensive Care Paramedic', 'Community Care'],
            value: '',
            expiryEnabled: false, expiry: '',
            refNoEnabled: true, refNo: '',
            attachmentEnabled: false, attachmentFile: '',
            commentEnabled: true,
            infoIcon: true,
          },
        ],
      }],
    },
    {
      name: 'JJA Request Collection',
      requiredCount: 0,
      subCollections: [{
        label: 'JJA Request Collection',
        items: [
          {
            name: 'JJA Request Boolean',
            description: 'Indicate if this placement is part of a JJA request',
            editType: 'boolean',
            value: 'Yes',
            expiryEnabled: false, expiry: '',
            refNoEnabled: false, refNo: '',
            attachmentEnabled: false, attachmentFile: '',
            commentEnabled: true, comment: 'Confirmed by coordinator',
          },
          {
            name: 'JJA Request Combo',
            description: 'Select the associated JJA account code',
            editType: 'select',
            options: ['BS63MIR-ACCOUNT', 'BS64XYZ-ACCOUNT', 'BS65ABC-ACCOUNT'],
            value: 'BS63MIR-ACCOUNT',
            expiryEnabled: true, expiry: '',
            refNoEnabled: false, refNo: '',
            attachmentEnabled: true, attachmentFile: 'jja_agreement.pdf',
          },
          {
            name: 'JJA Request Date',
            description: 'Specify the JJA request submission date',
            editType: 'date',
            value: '2024-03-15',
            expiryEnabled: false, expiry: '',
            refNoEnabled: true, refNo: '',
            attachmentEnabled: false, attachmentFile: '',
          },
        ],
      }],
    },
  ]);

  readonly openMultiSelectAttr = signal<string | null>(null);
  /** Single signal for all popovers — only one can be open at a time.
   *  Key format: "<type>:<collName>|<subLabel>|<itemName>"  */
  readonly openPopover = signal<string | null>(null);

  attrKey(collName: string, subLabel: string, itemName: string): string {
    return `${collName}|${subLabel}|${itemName}`;
  }

  toggleMultiSelect(key: string): void {
    this.openMultiSelectAttr.update(v => v === key ? null : key);
    this.openPopover.set(null);
  }

  toggleMultiOption(collName: string, subLabel: string, itemName: string, option: string): void {
    this.attributeCollections.update(colls => colls.map(c => c.name !== collName ? c : {
      ...c,
      subCollections: c.subCollections.map(s => s.label !== subLabel ? s : {
        ...s,
        items: s.items.map(i => {
          if (i.name !== itemName) return i;
          const sel = i.selectedOptions ?? [];
          const next = sel.includes(option) ? sel.filter(o => o !== option) : [...sel, option];
          return { ...i, selectedOptions: next, value: next.join(', ') };
        }),
      }),
    }));
  }

  updateAttrValue(collName: string, subLabel: string, itemName: string, patch: Partial<AttributeItem>): void {
    this.attributeCollections.update(colls => colls.map(c => c.name !== collName ? c : {
      ...c,
      subCollections: c.subCollections.map(s => s.label !== subLabel ? s : {
        ...s,
        items: s.items.map(i => i.name !== itemName ? i : { ...i, ...patch }),
      }),
    }));
  }

  toggleAttachmentPopover(key: string): void {
    this.openPopover.update(v => v === `attach:${key}` ? null : `attach:${key}`);
    this.openMultiSelectAttr.set(null);
  }

  removeAttachment(collName: string, subLabel: string, itemName: string): void {
    this.updateAttrValue(collName, subLabel, itemName, { attachmentFile: '' });
    this.openPopover.set(null);
  }

  attrFileId(collName: string, subLabel: string, itemName: string): string {
    return 'attr-file-' + this.attrKey(collName, subLabel, itemName).replace(/[| ]/g, '-');
  }

  handleAttachClick(collName: string, subLabel: string, itemName: string): void {
    document.getElementById(this.attrFileId(collName, subLabel, itemName))?.click();
  }

  toggleCommentPopover(key: string): void {
    this.openPopover.update(v => v === `comment:${key}` ? null : `comment:${key}`);
    this.openMultiSelectAttr.set(null);
  }

  saveComment(collName: string, subLabel: string, itemName: string, comment: string): void {
    this.updateAttrValue(collName, subLabel, itemName, { comment });
  }

  toggleRefNoPopover(key: string): void {
    this.openPopover.update(v => v === `refno:${key}` ? null : `refno:${key}`);
    this.openMultiSelectAttr.set(null);
  }

  saveRefNo(collName: string, subLabel: string, itemName: string, refNo: string): void {
    this.updateAttrValue(collName, subLabel, itemName, { refNo });
  }

  openDatePicker(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rect = input.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const calendarHeight = 300;
    if (spaceBelow < calendarHeight) {
      const scrollable = input.closest('.sheet-body');
      if (scrollable) {
        scrollable.scrollBy({ top: calendarHeight - spaceBelow + 16, behavior: 'smooth' });
        setTimeout(() => input.showPicker?.(), 180);
        return;
      }
    }
    input.showPicker?.();
  }

  /** Forward wheel events from the overlay so the page scrolls while the sheet blocks clicks. */
  onOverlayWheel(event: WheelEvent): void {
    event.preventDefault();
    window.scrollBy({ left: event.deltaX, top: event.deltaY });
  }

  /** Close all attribute popovers/dropdowns when clicking outside them. */
  onDocumentClick(event: Event): void {
    const target = event.target as Element;
    const inside = target.closest(
      '.attr-field-popover, .attr-attachment-popover, .attr-icon-btn, ' +
      '.attr-multiselect-dropdown, .attr-multiselect-trigger, .attr-multiselect-option'
    );
    if (!inside) {
      this.openPopover.set(null);
      this.openMultiSelectAttr.set(null);
    }
    if (!target.closest('.col-menu-wrapper')) {
      this.showColumnMenu.set(false);
      this.colMenuQuery.set('');
      this.attrSearchQuery.set('');
      this.colMenuEditItem.set(null);
    }
    if (!target.closest('.erref-search-popover, .col-menu-add-attr-link')) {
      this.showErrefSearch.set(false);
    }
    if (!target.closest('.nested-action-wrapper')) {
      this.openNestedActionKey.set(null);
    }
    if (!target.closest('.nested-col-menu-wrapper') && !target.closest('.col-menu')) {
      this.showNestedColMenu.set(false);
      this.nestedAttrSearchQuery.set('');
    }
    if (!target.closest('.alloc-col-menu-wrapper') && !target.closest('.col-menu')) {
      this.showAllocColMenu.set(false);
      this.allocAttrSearchQuery.set('');
    }
    if (!target.closest('.nested-attr-options-wrapper')) {
      this.openNestedAttrOptionsId.set(null);
      this.openAttrOptionsId.set(null);
      this.allocOpenAttrOptionsId.set(null);
    }
  }

  handleFileSelect(collName: string, subLabel: string, itemName: string, fileName: string | undefined): void {
    if (fileName) {
      this.updateAttrValue(collName, subLabel, itemName, { attachmentFile: fileName });
    }
  }

  formatAttrDate(val: string): string {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }

  isAttrCollapsed(name: string): boolean {
    return this.collapseAllAttrs() || this.collapsedAttrCollections().has(name);
  }

  toggleAttrCollection(name: string): void {
    if (this.collapseAllAttrs()) {
      // expand just this one; uncheck collapse-all
      this.collapseAllAttrs.set(false);
      const all = new Set(this.attributeCollections().map(c => c.name));
      all.delete(name);
      this.collapsedAttrCollections.set(all);
    } else {
      this.collapsedAttrCollections.update(set => {
        const next = new Set(set);
        next.has(name) ? next.delete(name) : next.add(name);
        return next;
      });
    }
  }

  toggleCollapseAll(): void {
    const next = !this.collapseAllAttrs();
    this.collapseAllAttrs.set(next);
    this.collapsedAttrCollections.set(new Set());
  }

  // Placement Time section
  readonly showPlacementTimeSection = signal(false);
  readonly showPerDayTimes           = signal(false);
  readonly workingDays = signal<Record<string, boolean>>({
    Mon: true, Tue: true, Wed: true, Thu: true, Fri: true, Sat: false, Sun: false,
  });
  readonly shiftType       = signal('Custom');
  readonly globalStartTime = signal('09:00');
  readonly globalEndTime   = signal('17:00');
  readonly activeWeek      = signal(1);
  readonly weeks           = signal<number[]>([1]);
  readonly templateName           = signal('');
  readonly showSaveTemplateInput  = signal(false);
  readonly groupCode              = signal('');
  readonly perDayShiftTypes = signal<Record<string, string>>({
    Mon: 'Custom', Tue: 'Custom', Wed: 'Custom', Thu: 'Custom', Fri: 'Custom', Sat: 'Custom', Sun: 'Custom',
  });
  readonly perDayTimes = signal<Record<string, { start: string; end: string }>>({
    Mon: { start: '09:00', end: '17:00' }, Tue: { start: '09:00', end: '17:00' },
    Wed: { start: '09:00', end: '17:00' }, Thu: { start: '09:00', end: '17:00' },
    Fri: { start: '09:00', end: '17:00' }, Sat: { start: '09:00', end: '17:00' },
    Sun: { start: '09:00', end: '17:00' },
  });

  readonly daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
  readonly shiftTypeOptions = ['Custom', 'AM', 'PM', 'Full Day', 'Half Day', 'Shift', 'Night', 'None'] as const;

  readonly columnVisibility = signal({
    placementBlock: true,
    specialism: true,
    location: true,
    requestQueue: true,
    draftRequest: true,
    sent: true,
    agenciesRequested: true,
  });


  readonly students = signal<Student[]>([
    {
      name: 'Ben Trinh (AVSTTU0015)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Emergency Care',
      location: '',
      agencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria'],
      requestedAgencies: ['Melbourne Emergency Services', 'Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Emergency Care', ranking: 100, location: 'Melbourne, VIC', placements: 15 },
        { name: 'Royal Ambulance Victoria',     specialism: 'Emergency Care', ranking: 60,  location: 'Richmond, VIC',  placements: 12 },
      ],
      agencyDetails: [
        { name: 'City Medical Response Unit',       specialism: 'Emergency Care', ranking: 90, location: 'Melbourne, VIC',  placements: 8,  status: 'excluded' },
        { name: 'Northern Emergency Care',          specialism: 'Emergency Care', ranking: 70, location: 'Richmond, VIC',   placements: 10, status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
        { name: 'Western Metro Ambulance',          specialism: 'Emergency Care', ranking: 60, location: 'Carlton, VIC',    placements: 9  },
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 40, location: 'Southbank, VIC',  placements: 7  },
        { name: 'Metropolitan Health Network',      specialism: 'Emergency Care', ranking: 30, location: 'Brunswick, VIC',  placements: 5  },
      ],
    },
    {
      name: 'Chris Krejcie (AVSTTU0024)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Critical Care',
      location: '',
      agencies: ['Melbourne Emergency Services'],
      requestedAgencies: ['Royal Ambulance Victoria', 'Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Critical Care', ranking: 100, location: 'Carlton, VIC', placements: 18 },
      ],
      agencyDetails: [
        { name: 'Western Metro Ambulance',          specialism: 'Critical Care', ranking: 90, location: 'Carlton, VIC',   placements: 14 },
        { name: 'Northern Emergency Care',          specialism: 'Critical Care', ranking: 60, location: 'Essendon, VIC',  placements: 6,  status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
        { name: 'South Eastern Paramedic Services', specialism: 'Critical Care', ranking: 40, location: 'Southbank, VIC', placements: 4  },
      ],
    },
    {
      name: 'Clark Larkin (AVSTUQ016)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: '',
      location: '',
      agencies: ['Royal Ambulance Victoria', 'Metropolitan Health Network'],
      requestedAgencies: ['Melbourne Emergency Services'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria',    specialism: 'Emergency Care', ranking: 70, location: 'Footscray, VIC', placements: 11 },
        { name: 'Metropolitan Health Network', specialism: 'Emergency Care', ranking: 40, location: 'Brunswick, VIC',  placements: 9  },
      ],
      agencyDetails: [
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 60, location: 'Footscray, VIC', placements: 13, status: 'excluded' },
        { name: 'Northern Emergency Care',          specialism: 'Emergency Care', ranking: 30, location: 'Brunswick, VIC',  placements: 7,  status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
        { name: 'City Medical Response Unit',       specialism: 'Emergency Care', ranking: 90, location: 'Melbourne, VIC',  placements: 11 },
        { name: 'Western Metro Ambulance',          specialism: 'Emergency Care', ranking: 70, location: 'Carlton, VIC',    placements: 8  },
      ],
    },
    {
      name: 'Debra Trimeles (AVSTUD902)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Intensive Care Paramedic',
      location: 'Clifton Hill, VIC',
      agencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria', 'City Medical Response Unit'],
      requestedAgencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services',  specialism: 'Intensive Care Paramedic', ranking: 100, location: 'Melbourne, VIC', placements: 16 },
        { name: 'Royal Ambulance Victoria',      specialism: 'Intensive Care Paramedic', ranking: 90,  location: 'Richmond, VIC',  placements: 14 },
        { name: 'City Medical Response Unit',    specialism: 'Intensive Care Paramedic', ranking: 60,  location: 'Brunswick, VIC', placements: 11 },
      ],
      agencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Intensive Care Paramedic', ranking: 100, location: 'Melbourne, VIC', placements: 19, status: 'excluded' },
        { name: 'Western Metro Ambulance',    specialism: 'Intensive Care Paramedic', ranking: 90,  location: 'Richmond, VIC',  placements: 13 },
        { name: 'Northern Emergency Care',    specialism: 'Intensive Care Paramedic', ranking: 40,  location: 'Brunswick, VIC', placements: 8,  status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
      ],
    },
    {
      name: 'Hannah Torin (AVSTUU007)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: '',
      location: '',
      agencies: ['Royal Ambulance Victoria'],
      requestedAgencies: ['Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria', specialism: 'Emergency Care', ranking: 70, location: 'Richmond, VIC', placements: 10 },
      ],
      agencyDetails: [
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 60, location: 'Richmond, VIC', placements: 12, status: 'excluded' },
      ],
    },
    {
      name: 'Lisa Learad (AVSTUU005)',
      details: '5 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Critical Care',
      location: 'Mount Waverley, VIC',
      agencies: ['Melbourne Emergency Services', 'South Eastern Paramedic Services'],
      requestedAgencies: ['Royal Ambulance Victoria'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services',     specialism: 'Critical Care', ranking: 100, location: 'Melbourne, VIC',  placements: 14 },
        { name: 'South Eastern Paramedic Services', specialism: 'Critical Care', ranking: 60,  location: 'Southbank, VIC',  placements: 8  },
      ],
      agencyDetails: [
        { name: 'Royal Ambulance Victoria',    specialism: 'Critical Care', ranking: 90, location: 'Richmond, VIC',  placements: 11 },
        { name: 'Western Metro Ambulance',     specialism: 'Critical Care', ranking: 70, location: 'Carlton, VIC',   placements: 9  },
        { name: 'Northern Emergency Care',     specialism: 'Critical Care', ranking: 40, location: 'Essendon, VIC',  placements: 5, status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
      ],
    },
    {
      name: 'Phillip Parker (AVSTUQ020)',
      details: '2 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Community Paramedic',
      location: '',
      agencies: ['Metropolitan Health Network'],
      requestedAgencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria', 'City Medical Response Unit'],
      queuedAgencyDetails: [
        { name: 'Metropolitan Health Network', specialism: 'Community Paramedic', ranking: 70, location: 'Brunswick, VIC', placements: 7 },
      ],
      agencyDetails: [
        { name: 'Melbourne Emergency Services',     specialism: 'Community Paramedic', ranking: 100, location: 'Melbourne, VIC', placements: 12 },
        { name: 'Royal Ambulance Victoria',         specialism: 'Community Paramedic', ranking: 90,  location: 'Richmond, VIC',  placements: 10 },
        { name: 'City Medical Response Unit',       specialism: 'Community Paramedic', ranking: 60,  location: 'Melbourne, VIC', placements: 6  },
        { name: 'Western Metro Ambulance',          specialism: 'Community Paramedic', ranking: 40,  location: 'Carlton, VIC',   placements: 4  },
      ],
    },
    {
      name: 'Rebeccca Harrison (AVSTUD017)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Emergency Care',
      location: '',
      agencies: ['Melbourne Emergency Services', 'City Medical Response Unit'],
      requestedAgencies: ['Metropolitan Health Network'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Emergency Care', ranking: 100, location: 'Melbourne, VIC', placements: 16 },
        { name: 'City Medical Response Unit',   specialism: 'Emergency Care', ranking: 70,  location: 'Melbourne, VIC', placements: 9  },
      ],
      agencyDetails: [
        { name: 'Royal Ambulance Victoria',         specialism: 'Emergency Care', ranking: 90, location: 'Richmond, VIC',  placements: 13 },
        { name: 'Metropolitan Health Network',      specialism: 'Emergency Care', ranking: 60, location: 'Brunswick, VIC', placements: 7  },
        { name: 'Northern Emergency Care',          specialism: 'Emergency Care', ranking: 30, location: 'Essendon, VIC',  placements: 5, status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 40, location: 'Southbank, VIC', placements: 6  },
      ],
    },
    {
      name: 'Rob Tran (AVSTUD003)',
      details: '8 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Critical Care',
      location: 'Mitcham, VIC',
      agencies: ['Royal Ambulance Victoria', 'South Eastern Paramedic Services'],
      requestedAgencies: ['Melbourne Emergency Services', 'Royal Ambulance Victoria'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria',         specialism: 'Critical Care', ranking: 90, location: 'Richmond, VIC',  placements: 13 },
        { name: 'South Eastern Paramedic Services', specialism: 'Critical Care', ranking: 60, location: 'Southbank, VIC', placements: 8  },
      ],
      agencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Critical Care', ranking: 100, location: 'Melbourne, VIC', placements: 17 },
        { name: 'Western Metro Ambulance',      specialism: 'Critical Care', ranking: 70,  location: 'Carlton, VIC',   placements: 10 },
        { name: 'Northern Emergency Care',      specialism: 'Critical Care', ranking: 40,  location: 'Essendon, VIC',  placements: 5, status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
      ],
    },
    {
      name: 'Victor Torin (AVSTUD013)',
      details: '6 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Emergency Care',
      location: '',
      agencies: ['Melbourne Emergency Services'],
      requestedAgencies: ['Royal Ambulance Victoria', 'City Medical Response Unit'],
      queuedAgencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Emergency Care', ranking: 100, location: 'Melbourne, VIC', placements: 15 },
      ],
      agencyDetails: [
        { name: 'Royal Ambulance Victoria',    specialism: 'Emergency Care', ranking: 90, location: 'Richmond, VIC',  placements: 12 },
        { name: 'City Medical Response Unit',  specialism: 'Emergency Care', ranking: 70, location: 'Melbourne, VIC', placements: 8  },
        { name: 'Western Metro Ambulance',     specialism: 'Emergency Care', ranking: 60, location: 'Carlton, VIC',   placements: 7  },
        { name: 'Metropolitan Health Network', specialism: 'Emergency Care', ranking: 30, location: 'Brunswick, VIC', placements: 4  },
      ],
    },
    {
      name: 'Yanessa Trimeles (AVSTUD014)',
      details: '12 Days On-Road Emergency',
      block: 'Feb Roster',
      period: '12/02/2024 - 24/02/2024',
      specialism: 'Intensive Care Paramedic',
      location: '',
      agencies: ['Royal Ambulance Victoria'],
      requestedAgencies: ['Melbourne Emergency Services'],
      queuedAgencyDetails: [
        { name: 'Royal Ambulance Victoria', specialism: 'Intensive Care Paramedic', ranking: 90, location: 'Richmond, VIC', placements: 11 },
      ],
      agencyDetails: [
        { name: 'Melbourne Emergency Services', specialism: 'Intensive Care Paramedic', ranking: 100, location: 'Melbourne, VIC', placements: 18 },
        { name: 'City Medical Response Unit',   specialism: 'Intensive Care Paramedic', ranking: 70,  location: 'Brunswick, VIC', placements: 9  },
        { name: 'Western Metro Ambulance',      specialism: 'Intensive Care Paramedic', ranking: 60,  location: 'Richmond, VIC',  placements: 7  },
        { name: 'Northern Emergency Care',      specialism: 'Intensive Care Paramedic', ranking: 40,  location: 'Essendon, VIC',  placements: 4, status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
      ],
    },
    {
      name: 'Emma Wilson (AVSTTU025)',
      details: '10 Days On-Road Emergency',
      block: 'March Roster',
      period: '01/03/2024 - 11/03/2024',
      specialism: 'Emergency Care',
      location: 'Brunswick, VIC',
      agencies: ['City Medical Response Unit', 'Northern Emergency Care'],
      requestedAgencies: ['Melbourne Emergency Services'],
      queuedAgencyDetails: [
        { name: 'City Medical Response Unit', specialism: 'Emergency Care', ranking: 90, location: 'Melbourne, VIC', placements: 10 },
        { name: 'Northern Emergency Care',    specialism: 'Emergency Care', ranking: 60, location: 'Essendon, VIC',  placements: 7  },
      ],
      agencyDetails: [
        { name: 'Melbourne Emergency Services',     specialism: 'Emergency Care', ranking: 100, location: 'Melbourne, VIC', placements: 15 },
        { name: 'Royal Ambulance Victoria',         specialism: 'Emergency Care', ranking: 70,  location: 'Richmond, VIC',  placements: 11 },
        { name: 'South Eastern Paramedic Services', specialism: 'Emergency Care', ranking: 40,  location: 'Southbank, VIC', placements: 6  },
        { name: 'Western Metro Ambulance',          specialism: 'Emergency Care', ranking: 30,  location: 'Carlton, VIC',   placements: 4  },
      ],
    },
    {
      name: 'James Mitchell (AVSTTU026)',
      details: '8 Days On-Road Emergency',
      block: 'March Roster',
      period: '01/03/2024 - 11/03/2024',
      specialism: 'Critical Care',
      location: '',
      agencies: ['Western Metro Ambulance'],
      requestedAgencies: ['Royal Ambulance Victoria', 'City Medical Response Unit'],
      queuedAgencyDetails: [
        { name: 'Western Metro Ambulance', specialism: 'Critical Care', ranking: 70, location: 'Carlton, VIC', placements: 8 },
      ],
      agencyDetails: [
        { name: 'Royal Ambulance Victoria',    specialism: 'Critical Care', ranking: 100, location: 'Richmond, VIC',  placements: 16 },
        { name: 'City Medical Response Unit',  specialism: 'Critical Care', ranking: 90,  location: 'Melbourne, VIC', placements: 12 },
        { name: 'Melbourne Emergency Services',specialism: 'Critical Care', ranking: 60,  location: 'Melbourne, VIC', placements: 9  },
        { name: 'Northern Emergency Care',     specialism: 'Critical Care', ranking: 40,  location: 'Essendon, VIC',  placements: 5, status: 'incompatible', incompatibleReason: 'Incompatible. Has Parent working at site.' },
      ],
    },
  ]);

  readonly allSelected = computed(
    () => this.selectedStudents().size === this.students().length,
  );

  readonly selectedCount = computed(() => this.selectedStudents().size);

  readonly selectedStudentsForSummary = computed(() => {
    const sel = this.selectedStudents();
    return this.students().filter((_, i) => sel.has(i));
  });

  readonly summaryStudents  = computed(() => this.selectedStudentsForSummary().length);
  readonly summaryBlocks    = computed(() => new Set(this.selectedStudentsForSummary().map(s => s.block)).size);
  readonly summaryAgencies  = computed(() => new Set(this.selectedStudentsForSummary().flatMap(s => s.queuedAgencyDetails.map(a => a.name))).size);
  readonly summaryRequests  = computed(() => this.selectedStudentsForSummary().reduce((n, s) => n + s.queuedAgencyDetails.length, 0));

  readonly summaryBlockGroups = computed(() => {
    type ExpGroup = { experience: string; students: { name: string; specialism: string }[] };
    const blockMap = new Map<string, { block: string; period: string; expMap: Map<string, ExpGroup> }>();
    for (const s of this.selectedStudentsForSummary()) {
      if (!blockMap.has(s.block)) blockMap.set(s.block, { block: s.block, period: s.period, expMap: new Map() });
      const bGroup = blockMap.get(s.block)!;
      if (!bGroup.expMap.has(s.details)) bGroup.expMap.set(s.details, { experience: s.details, students: [] });
      bGroup.expMap.get(s.details)!.students.push({ name: s.name, specialism: s.specialism });
    }
    return [...blockMap.values()].map(b => {
      const experienceGroups = [...b.expMap.values()];
      return {
        block: b.block,
        period: b.period,
        totalStudents: experienceGroups.reduce((sum, eg) => sum + eg.students.length, 0),
        experienceGroups,
      };
    });
  });

  readonly summaryAgenciesList = computed(() => {
    const agencyMap = new Map<string, number>();
    for (const s of this.selectedStudentsForSummary()) {
      for (const a of s.queuedAgencyDetails) {
        agencyMap.set(a.name, (agencyMap.get(a.name) ?? 0) + 1);
      }
    }
    return [...agencyMap.entries()].map(([name, count]) => ({ name, count }));
  });

  readonly selectedBlocksList = computed(() => {
    const sel = this.selectedStudents();
    return [...new Set(
      this.students()
        .filter((_, i) => sel.has(i))
        .map(s => `${s.block} (${s.period})`),
    )];
  });

  toggleBlockGroup(block: string): void {
    this.expandedBlockGroups.update(set => {
      const next = new Set(set);
      next.has(block) ? next.delete(block) : next.add(block);
      return next;
    });
  }

  toggleRow(index: number): void {
    this.expandedRows.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  toggleStudent(index: number): void {
    this.selectedStudents.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  toggleAllStudents(): void {
    const all = this.students().length;
    this.selectedStudents.update(set =>
      set.size === all ? new Set() : new Set(Array.from({ length: all }, (_, i) => i)),
    );
  }

  openMatchBreakdown(ranking: number, agencyName: string, studentName: string): void {
    this.selectedRanking.set(ranking);
    this.selectedAgencyName.set(agencyName);
    this.selectedStudentName.set(studentName);
    this.showMatchBreakdown.set(true);
  }

  openCreateRequest(): void {
    this.showCreateRequestSheet.set(true);
    this.showBulkActionDropdown.set(false);
  }

  openTrialMatchSheet(): void {
    this.showTrialMatchSheet.set(true);
    this.showTrialMatchHelper.set(false);
  }

  openAddAgencySheet(student: Student): void {
    this.activeStudent.set(student);
    this.showAddAgencySheet.set(true);
  }

  openBulkAddAgencySheet(): void {
    this.showBulkAddAgencySheet.set(true);
    this.showBulkActionDropdown.set(false);
  }

  toggleActionMenu(index: number): void {
    this.openActionRowIndex.update(v => v === index ? null : index);
  }

  toggleNestedAction(key: string): void {
    this.openNestedActionKey.update(v => v === key ? null : key);
  }

  removeAgency(studentIndex: number, agencyName: string): void {
    this.students.update(list => list.map((s, i) => i !== studentIndex ? s : {
      ...s,
      queuedAgencyDetails: s.queuedAgencyDetails.filter(a => a.name !== agencyName),
    }));
  }

  toggleColumn(key: keyof ColVisibility): void {
    // When moving a column to "Available" (currently visible → off), clear its eye-hidden state
    // so it resets to fully visible when toggled back into view.
    if (this.columnVisibility()[key]) {
      this.eyeHiddenCols.update(s => { const n = new Set(s); n.delete(key); return n; });
    }
    this.columnVisibility.update(v => ({ ...v, [key]: !v[key] }));
  }

  toggleEyeHide(key: keyof ColVisibility): void {
    this.eyeHiddenCols.update(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }

  /** Returns true when a column should actually render in the table (in-view AND not eye-hidden). */
  isColVisible(key: keyof ColVisibility): boolean {
    return this.columnVisibility()[key] && !this.eyeHiddenCols().has(key);
  }

  getColLabel(key: keyof ColVisibility): string {
    return this.customColLabels()[key] ?? (this.columnDefs.find(c => c.key === key)?.label ?? String(key));
  }

  getAttrLabel(id: string): string {
    return this.customAttrLabels()[id] ?? (this.attrMap().get(id)?.name ?? id);
  }

  openColEdit(type: 'std' | 'attr', keyOrId: string): void {
    if (type === 'std') {
      const key = keyOrId as keyof ColVisibility;
      this.colMenuEditItem.set({ type: 'std', key });
      this.colMenuEditLabel.set(this.getColLabel(key));
    } else {
      this.colMenuEditItem.set({ type: 'attr', id: keyOrId });
      // Pre-fill with any existing custom display name; blank if none set
      this.colMenuEditLabel.set(this.customAttrLabels()[keyOrId] ?? '');
    }
    this.colMenuEditDesc.set('');
  }

  saveColEdit(): void {
    const item = this.colMenuEditItem();
    if (!item) return;
    const label = this.colMenuEditLabel().trim();
    if (item.type === 'std') {
      if (label) this.customColLabels.update(m => ({ ...m, [item.key]: label }));
    } else {
      if (label) this.customAttrLabels.update(m => ({ ...m, [item.id]: label }));
    }
    this.colMenuEditItem.set(null);
  }

  closeColEdit(): void {
    this.colMenuEditItem.set(null);
  }

  addAttributeColumn(attr: ErrefAttribute): void {
    if (this.addedAttrColumns().length >= this.attrMax) return;
    this.addedAttrColumns.update(cols => [...cols, attr]);
    this.columnOrder.update(order => [...order, attr.id]);
    this.errefSearchQuery.set('');
    this.showErrefSearch.set(false);
    this.attrSearchQuery.set('');
  }

  removeAttributeColumn(id: string): void {
    this.addedAttrColumns.update(cols => cols.filter(a => a.id !== id));
    this.hiddenAttrColumns.update(s => { const next = new Set(s); next.delete(id); return next; });
    this.columnOrder.update(order => order.filter(k => k !== id));
  }

  toggleAttrOptions(id: string): void {
    this.openAttrOptionsId.update(v => v === id ? null : id);
    this.showErrefSearch.set(false);
  }

  toggleMainErrefSearch(): void {
    this.showErrefSearch.update(v => !v);
    this.openAttrOptionsId.set(null);
  }

  moveColUp(id: string): void {
    this.columnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx <= 0) return order;
      const next = [...order];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  moveColDown(id: string): void {
    this.columnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx < 0 || idx >= order.length - 1) return order;
      const next = [...order];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  getAttrName(id: string): string {
    return this.attrMap().get(id)?.name ?? id;
  }

  toggleNestedColumn(key: NestedColKey): void {
    this.nestedColVisibility.update(v => ({ ...v, [key]: !v[key] }));
  }

  addNestedAttributeColumn(attr: ErrefAttribute): void {
    if (this.addedNestedAttrColumns().length >= this.nestedAttrMax) return;
    this.addedNestedAttrColumns.update(cols => [...cols, attr]);
    this.nestedColumnOrder.update(order => [...order, attr.id]);
    this.nestedAttrSearchQuery.set('');
  }

  removeNestedAttributeColumn(id: string): void {
    this.addedNestedAttrColumns.update(cols => cols.filter(a => a.id !== id));
    this.hiddenNestedAttrColumns.update(s => { const next = new Set(s); next.delete(id); return next; });
    this.nestedColumnOrder.update(order => order.filter(k => k !== id));
  }

  toggleNestedAttrColumn(id: string): void {
    this.hiddenNestedAttrColumns.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleNestedAttrOptions(id: string): void {
    this.openNestedAttrOptionsId.update(v => v === id ? null : id);
    this.showNestedErrefSearch.set(false);
  }

  toggleNestedErrefSearch(): void {
    this.showNestedErrefSearch.update(v => !v);
    this.openNestedAttrOptionsId.set(null);
  }

  /** Move a column key one step up in the unified nestedColumnOrder. */
  moveNestedColUp(id: string): void {
    this.nestedColumnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx <= 0) return order;
      const next = [...order];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  /** Move a column key one step down in the unified nestedColumnOrder. */
  moveNestedColDown(id: string): void {
    this.nestedColumnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx < 0 || idx >= order.length - 1) return order;
      const next = [...order];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  getNestedAttrName(id: string): string {
    return this.addedNestedAttrMap().get(id)?.name ?? id;
  }

  readonly nestedColMenuEditItem = signal<{ type: 'attr'; id: string } | null>(null);
  readonly nestedColMenuEditLabel = signal<string>('');
  readonly nestedCustomAttrLabels = signal<Record<string, string>>({});
  readonly nestedColMenuEditAttr = computed(() => {
    const item = this.nestedColMenuEditItem();
    if (!item) return null;
    return this.nestedErrefAttributes.find(a => a.id === item.id) ?? null;
  });
  openNestedColEdit(id: string): void {
    this.nestedColMenuEditItem.set({ type: 'attr', id });
    this.nestedColMenuEditLabel.set(this.nestedCustomAttrLabels()[id] ?? '');
  }
  closeNestedColEdit(): void {
    this.nestedColMenuEditItem.set(null);
    this.nestedColMenuEditLabel.set('');
  }
  saveNestedColEdit(): void {
    const item = this.nestedColMenuEditItem();
    if (!item) return;
    const label = this.nestedColMenuEditLabel().trim();
    this.nestedCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.nestedColMenuEditItem.set(null);
    this.nestedColMenuEditLabel.set('');
  }
  getNestedAttrLabel(id: string): string {
    const custom = this.nestedCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.nestedErrefAttributes.find(a => a.id === id)?.name ?? id;
  }

  getNestedErrefValue(agencyName: string, errefId: string): string {
    return this.nestedErrefAgencyData[agencyName]?.[errefId] ?? '';
  }

  toggleAttrColumn(id: string): void {
    this.hiddenAttrColumns.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  readonly columnDefs: Array<{ key: keyof ColVisibility; label: string }> = [
    { key: 'placementBlock',    label: 'Placement Block' },
    { key: 'specialism',        label: 'Specialism' },
    { key: 'location',          label: 'Location' },
    { key: 'requestQueue',      label: 'Request Plan' },
    { key: 'draftRequest',      label: 'Planned Agencies' },
    { key: 'sent',              label: 'Sent' },
    { key: 'agenciesRequested', label: 'Agencies Requested' },
  ];

  readonly selectedStudentsList = computed(() => {
    const sel = this.selectedStudents();
    return this.students().filter((_, i) => sel.has(i));
  });


  toggleWorkingDay(day: string): void {
    this.workingDays.update(d => ({ ...d, [day]: !d[day] }));
  }

  updateShiftType(type: string): void {
    this.shiftType.set(type);
    if (type === 'Custom') {
      this.globalStartTime.set('09:00');
      this.globalEndTime.set('17:00');
      const defaultTimes: Record<string, { start: string; end: string }> = {};
      for (const day of this.daysOfWeek) defaultTimes[day] = { start: '09:00', end: '17:00' };
      this.perDayTimes.set(defaultTimes);
    }
  }

  updatePerDayShiftType(day: string, type: string): void {
    this.perDayShiftTypes.update(s => ({ ...s, [day]: type }));
  }

  updatePerDayTime(day: string, field: 'start' | 'end', val: string): void {
    this.perDayTimes.update(t => ({ ...t, [day]: { ...t[day], [field]: val } }));
  }

  addWeek(): void {
    this.weeks.update(ws => [...ws, Math.max(...ws) + 1]);
  }

  removeWeek(weekNum: number): void {
    this.weeks.update(ws => ws.filter(w => w !== weekNum));
    if (this.activeWeek() === weekNum) {
      this.activeWeek.set(this.weeks()[0] ?? 1);
    }
  }

  // Notes and Documents section
  readonly showNotesAndDocsSection = signal(false);
  private nextNoteId = 2;
  private nextDocId = 2;

  readonly notes = signal<NoteItem[]>([
    {
      id: 1,
      noteType: 'General',
      title: 'Initial placement review completed',
      text: 'All student requirements have been reviewed and initial agency placements have been assigned based on student preferences.',
      reminder: '',
      keepPrivate: false,
      changedByUser: 'John Doe',
      createdDate: '03/10/2026 9:14am',
    },
  ]);

  readonly documents = signal<DocumentItem[]>([
    { id: 1, title: 'Student Placement Agreement', description: 'Signed agreement form for this placement request', fileName: 'placement_agreement_2024.pdf' },
  ]);

  readonly flashingNoteIds = signal<Set<number>>(new Set());
  readonly flashingDocIds = signal<Set<number>>(new Set());

  addNote(): void {
    const id = this.nextNoteId++;
    this.notes.update(ns => [...ns, { id, noteType: 'General', title: '', text: '', reminder: '', keepPrivate: false, changedByUser: 'John Doe', createdDate: 'Just now' }]);
  }

  deleteNote(id: number): void {
    this.notes.update(ns => ns.filter(n => n.id !== id));
  }

  saveNote(id: number, field: keyof NoteItem, value: string | boolean): void {
    this.notes.update(ns => ns.map(n => n.id === id ? { ...n, [field]: value } : n));
    this.flashingNoteIds.update(s => new Set([...s, id]));
    setTimeout(() => this.flashingNoteIds.update(s => { const n = new Set(s); n.delete(id); return n; }), 700);
  }

  addDocument(): void {
    const id = this.nextDocId++;
    this.documents.update(ds => [...ds, { id, title: '', description: '', fileName: '' }]);
    setTimeout(() => {
      const inputs = document.querySelectorAll<HTMLInputElement>('.nd-doc-label-input');
      inputs[inputs.length - 1]?.focus();
    }, 50);
  }

  deleteDocument(id: number): void {
    this.documents.update(ds => ds.filter(d => d.id !== id));
  }

  saveDocument(id: number, field: keyof DocumentItem, value: string): void {
    this.documents.update(ds => ds.map(d => d.id === id ? { ...d, [field]: value } : d));
    this.flashingDocIds.update(s => new Set([...s, id]));
    setTimeout(() => this.flashingDocIds.update(s => { const n = new Set(s); n.delete(id); return n; }), 700);
  }

  readonly allocBlocks = [
    { id: 'unallocated', label: 'Unallocated'    },
    { id: 'vs-march',    label: 'VS March block' },
    { id: 'vs-april',    label: 'VS April block' },
    { id: 'vs-may-1',    label: 'VS May block 1' },
    { id: 'vs-may-2',    label: 'VS May block 2' },
  ];

  readonly allocRows = signal([
    { studentName: 'Carolee Wagner (WAG19779494_JJA)', requirement: '30 Days Cardiology',                            selectedBlock: 'unallocated' },
    { studentName: 'Carolee Wagner (WAG19779494_JJA)', requirement: '30 Days Critical Care (Emerg, ICU, HDU, CCU)',  selectedBlock: 'unallocated' },
    { studentName: 'Carolee Wagner (WAG19779494_JJA)', requirement: '30 Days Aged Care',                             selectedBlock: 'unallocated' },
    { studentName: 'Edgar Abbott (ABB19780311_JJA)',   requirement: '30 Days Cardiology',                            selectedBlock: 'unallocated' },
    { studentName: 'Edgar Abbott (ABB19780311_JJA)',   requirement: '30 Days Critical Care (Emerg, ICU, HDU, CCU)',  selectedBlock: 'unallocated' },
    { studentName: 'Edgar Abbott (ABB19780311_JJA)',   requirement: '30 Days Aged Care',                             selectedBlock: 'unallocated' },
    { studentName: 'Erin Crotty (CRO19779521_JJA)',   requirement: '30 Days Cardiology',                            selectedBlock: 'unallocated' },
    { studentName: 'Erin Crotty (CRO19779521_JJA)',   requirement: '30 Days Critical Care (Emerg, ICU, HDU, CCU)',  selectedBlock: 'unallocated' },
    { studentName: 'Erin Crotty (CRO19779521_JJA)',   requirement: '30 Days Aged Care',                             selectedBlock: 'unallocated' },
    { studentName: 'Florence Dilly (DIL19779594_JJA)', requirement: '30 Days Cardiology',                           selectedBlock: 'unallocated' },
    { studentName: 'Florence Dilly (DIL19779594_JJA)', requirement: '30 Days Critical Care (Emerg, ICU, HDU, CCU)', selectedBlock: 'unallocated' },
    { studentName: 'Florence Dilly (DIL19779594_JJA)', requirement: '30 Days Aged Care',                            selectedBlock: 'unallocated' },
  ]);

  readonly selectedAllocRows = signal<Set<number>>(new Set());
  readonly selectedAllocCount = computed(() => this.selectedAllocRows().size);

  /* ── Alloc table Show/Hide Columns ── */
  readonly showAllocColMenu       = signal(false);
  readonly allocOpenAttrOptionsId = signal<string | null>(null);
  readonly allocPrefsVisible      = signal(true);
  readonly allocAttrMax           = 5;
  readonly allocAttrRemaining     = computed(() => this.allocAttrMax - this.allocAddedAttrColumns().length);
  readonly allocAddedAttrColumns  = signal<ErrefAttribute[]>([]);
  readonly allocHiddenAttrColumns = signal<Set<string>>(new Set());
  readonly allocErrefSearchQuery  = signal('');
  readonly allocShowErrefSearch   = signal(false);

  /** Unified order: 'prefsReceived' + custom attr ids. */
  readonly allocColumnOrder = signal<string[]>(['prefsReceived']);

  readonly allocAttrMap = computed(() =>
    new Map(this.allocAddedAttrColumns().map(a => [a.id, a])),
  );

  /** Custom attrs in their current position order (for col-menu display). */
  readonly allocAttrColumnOrder = computed(() =>
    this.allocColumnOrder()
      .filter(k => k !== 'prefsReceived')
      .map(id => this.allocAttrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly allocAttrSearchQuery      = signal('');
  readonly allocSelectedCollection   = signal<string | null>(null);
  readonly allocAvailExpanded        = signal(true);

  readonly allocColLimit = 15;
  readonly allocColInUse = computed(() =>
    2 + this.allocBlocks.length
      + (this.allocPrefsVisible() ? 1 : 0)
      + this.allocAttrColumnOrder().filter(a => !this.allocHiddenAttrColumns().has(a.id)).length
  );
  readonly allocColAtCapacity = computed(() => this.allocColInUse() >= this.allocColLimit);

  readonly allocAttrsAvailable = computed(() =>
    this.allocAttrColumnOrder().filter(a => this.allocHiddenAttrColumns().has(a.id))
  );

  readonly allocErrefSearchResults = computed(() => {
    const q = this.allocAttrSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.allocAddedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(
      a => !added.has(a.id) && (a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
    );
  });
  readonly allocAttrCollections = computed(() => {
    const q = this.allocAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.allocAddedAttrColumns().map(a => a.id));
    const map = new Map<string, number>();
    for (const a of this.errefAttributes) {
      if (!added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)))
        map.set(a.collection, (map.get(a.collection) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  });
  readonly allocAttrsInCollection = computed(() => {
    const sel = this.allocSelectedCollection();
    if (!sel) return [] as ErrefAttribute[];
    const q = this.allocAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.allocAddedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(a =>
      !added.has(a.id) && a.collection === sel &&
      (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q))
    );
  });

  addAllocAttrColumn(attr: ErrefAttribute): void {
    if (this.allocAddedAttrColumns().length >= this.allocAttrMax) return;
    this.allocAddedAttrColumns.update(cols => [...cols, attr]);
    this.allocColumnOrder.update(order => [...order, attr.id]);
    this.allocAttrSearchQuery.set('');
  }

  removeAllocAttrColumn(id: string): void {
    this.allocAddedAttrColumns.update(cols => cols.filter(a => a.id !== id));
    this.allocHiddenAttrColumns.update(s => { const next = new Set(s); next.delete(id); return next; });
    this.allocColumnOrder.update(order => order.filter(k => k !== id));
  }

  toggleAllocAttrColumn(id: string): void {
    this.allocHiddenAttrColumns.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleAllocAttrOptions(id: string): void {
    this.allocOpenAttrOptionsId.update(v => v === id ? null : id);
    this.allocShowErrefSearch.set(false);
  }

  toggleAllocErrefSearch(): void {
    this.allocShowErrefSearch.update(v => !v);
    this.allocOpenAttrOptionsId.set(null);
  }

  moveAllocColUp(id: string): void {
    this.allocColumnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx <= 0) return order;
      const next = [...order];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  moveAllocColDown(id: string): void {
    this.allocColumnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx < 0 || idx >= order.length - 1) return order;
      const next = [...order];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  getAllocAttrName(id: string): string {
    return this.allocAttrMap().get(id)?.name ?? id;
  }

  readonly allocColMenuEditItem = signal<{ type: 'attr'; id: string } | null>(null);
  readonly allocColMenuEditLabel = signal<string>('');
  readonly allocCustomAttrLabels = signal<Record<string, string>>({});
  readonly allocColMenuEditAttr = computed(() => {
    const item = this.allocColMenuEditItem();
    if (!item) return null;
    return this.errefAttributes.find(a => a.id === item.id) ?? null;
  });
  openAllocColEdit(id: string): void {
    this.allocColMenuEditItem.set({ type: 'attr', id });
    this.allocColMenuEditLabel.set(this.allocCustomAttrLabels()[id] ?? '');
  }
  closeAllocColEdit(): void {
    this.allocColMenuEditItem.set(null);
    this.allocColMenuEditLabel.set('');
  }
  saveAllocColEdit(): void {
    const item = this.allocColMenuEditItem();
    if (!item) return;
    const label = this.allocColMenuEditLabel().trim();
    this.allocCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.allocColMenuEditItem.set(null);
    this.allocColMenuEditLabel.set('');
  }
  getAllocAttrLabel(id: string): string {
    const custom = this.allocCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.errefAttributes.find(a => a.id === id)?.name ?? id;
  }
  readonly allAllocSelected = computed(() =>
    this.allocRows().length > 0 && this.selectedAllocRows().size === this.allocRows().length
  );
  readonly bulkActionEnabled = computed(() =>
    this.activeTab() === 'allocation'
      ? this.selectedAllocRows().size > 0
      : this.activeTab() === 'send'
        ? this.sendTabSelectedCount() > 0
        : this.selectedStudents().size > 0
  );

  toggleAllocRow(idx: number): void {
    this.selectedAllocRows.update(set => {
      const next = new Set(set);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  toggleAllAllocRows(): void {
    this.selectedAllocRows.update(set =>
      set.size === this.allocRows().length
        ? new Set()
        : new Set(this.allocRows().map((_, i) => i))
    );
  }

  setAllocBlock(rowIdx: number, blockId: string): void {
    this.allocRows.update(rows =>
      rows.map((r, i) => i === rowIdx ? { ...r, selectedBlock: blockId } : r)
    );
  }

  selectAllInBlock(blockId: string): void {
    this.allocRows.update(rows => rows.map(r => ({ ...r, selectedBlock: blockId })));
  }

  readonly tabs = [
    { id: 'allocation', label: 'Placement Block Allocation' },
    { id: 'plan',       label: 'Plan and Create Requests' },
    { id: 'send',       label: 'Send Requests' },
    { id: 'process',    label: 'Process Responses' },
  ] as const;

  toggleAccordion(sig: WritableSignal<boolean>, id: string): void {
    sig.update(v => !v);
    if (sig()) {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
    }
  }
}
