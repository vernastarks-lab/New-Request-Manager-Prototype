import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Student } from '../models';

type ColKey = 'specialism' | 'location' | 'plc';

interface ErrefAttribute { id: string; name: string; description?: string; }

interface DetailsGroup {
  details: string;
  students: Student[];
}

interface BlockGroup {
  block: string;
  period: string;
  count: number;
  detailGroups: DetailsGroup[];
}

interface PlannedAgencyCount {
  name: string;
  count: number;
}

@Component({
  selector: 'app-bulk-add-agency-sheet',
  imports: [FormsModule],
  templateUrl: './bulk-add-agency-sheet.html',
  styleUrl: './bulk-add-agency-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocClick($event)' },
})
export class BulkAddAgencySheetComponent {
  readonly students           = input<Student[]>([]);
  readonly closed             = output<void>();

  // ── UI state ──
  readonly summaryExpanded    = signal(false);
  readonly searchText         = signal('');
  readonly agencyType         = signal('');
  readonly specialism         = signal('');
  readonly categories         = signal('');
  readonly integrationPartner = signal('');
  readonly groups             = signal('');
  readonly hasPlacements      = signal(false);
  readonly agencyStates       = signal<Record<string, string>>({});

  // ── Column visibility ──
  readonly showColMenu   = signal(false);
  readonly colVisibility = signal<Record<ColKey, boolean>>({
    specialism: true,
    location:   true,
    plc:        true,
  });

  readonly colDefs: { key: ColKey; label: string }[] = [
    { key: 'specialism', label: 'Specialism'   },
    { key: 'location',   label: 'Location'     },
    { key: 'plc',        label: 'Plc (LY+TY)'  },
  ];

  private readonly stdColKeys = ['specialism', 'location', 'plc'] as const;

  // ── Custom attribute columns ──
  readonly addedAttrColumns  = signal<ErrefAttribute[]>([]);
  readonly hiddenAttrColumns = signal<Set<string>>(new Set());

  readonly columnOrder = signal<string[]>(['specialism', 'location', 'plc']);

  readonly attrMap = computed(() =>
    new Map(this.addedAttrColumns().map(a => [a.id, a])),
  );

  readonly attrColumnOrder = computed(() =>
    this.columnOrder()
      .filter(k => !(this.stdColKeys as readonly string[]).includes(k))
      .map(id => this.attrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly errefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_4', name: 'Ambulance Victoria',   description: 'Metro or Rural classification assigned by Ambulance Victoria.' },
    { id: 'ERREF_5', name: 'NDIS Provider',         description: 'Indicates whether the agency is a registered NDIS provider.' },
    { id: 'ERREF_6', name: 'Partner Agreement',     description: 'Indicates whether a formal partner agreement is in place.' },
    { id: 'ERREF_7', name: 'Accreditation Status',  description: 'Current accreditation status of the agency.' },
    { id: 'ERREF_8', name: 'Max Capacity',          description: 'Maximum student capacity per placement block.' },
    { id: 'ERREF_9', name: 'Supervisor Available',  description: 'Whether a qualified supervisor is available.' },
    { id: 'ERREF_10', name: 'Rural Classification', description: 'MMM classification for rural and remote areas.' },
    { id: 'ERREF_11', name: 'Emergency Department', description: 'Whether the agency has an emergency department.' },
  ];

  readonly errefData: Record<string, Record<string, string>> = {
    'Melbourne Emergency Services':     { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes', ERREF_7: 'Full',    ERREF_8: '20', ERREF_9: 'Yes', ERREF_10: 'MMM1', ERREF_11: 'Yes' },
    'Royal Ambulance Victoria':         { ERREF_4: 'Rural', ERREF_5: 'No',  ERREF_6: 'Yes', ERREF_7: 'Partial', ERREF_8: '10', ERREF_9: 'No',  ERREF_10: 'MMM3', ERREF_11: 'No'  },
    'City Medical Response Unit':       { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'No',  ERREF_7: 'Full',    ERREF_8: '15', ERREF_9: 'Yes', ERREF_10: 'MMM1', ERREF_11: 'Yes' },
    'Northern Emergency Care':          { ERREF_4: 'Rural', ERREF_5: 'No',  ERREF_6: 'No',  ERREF_7: 'Partial', ERREF_8: '8',  ERREF_9: 'Yes', ERREF_10: 'MMM4', ERREF_11: 'No'  },
    'Western Metro Ambulance':          { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes', ERREF_7: 'Full',    ERREF_8: '12', ERREF_9: 'No',  ERREF_10: 'MMM2', ERREF_11: 'Yes' },
    'South Eastern Paramedic Services': { ERREF_4: 'Metro', ERREF_5: 'No',  ERREF_6: 'Yes', ERREF_7: 'Full',    ERREF_8: '18', ERREF_9: 'Yes', ERREF_10: 'MMM1', ERREF_11: 'No'  },
    'Metropolitan Health Network':      { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes', ERREF_7: 'Full',    ERREF_8: '25', ERREF_9: 'Yes', ERREF_10: 'MMM1', ERREF_11: 'Yes' },
  };

  // ── Col-menu sidesheet signals ──
  readonly bAttrSearchQuery  = signal<string>('');
  readonly bColMenuEditItem  = signal<{ type: 'attr'; id: string } | null>(null);
  readonly bColMenuEditLabel = signal<string>('');
  readonly bCustomAttrLabels = signal<Record<string, string>>({});

  readonly bColLimit = 15;

  readonly bColMenuEditAttr = computed(() => {
    const item = this.bColMenuEditItem();
    if (!item) return null;
    return this.errefAttributes.find(a => a.id === item.id) ?? null;
  });

  readonly bColDefsInView = computed(() =>
    this.colDefs.filter(c => this.colVisibility()[c.key]),
  );

  readonly bColDefsAvailable = computed(() =>
    this.colDefs.filter(c => !this.colVisibility()[c.key]),
  );

  readonly bAttrColsInView = computed(() =>
    this.attrColumnOrder().filter(a => !this.hiddenAttrColumns().has(a.id)),
  );

  readonly bAttrColsAvailable = computed(() =>
    this.attrColumnOrder().filter(a => this.hiddenAttrColumns().has(a.id)),
  );

  readonly bAttrsUnadded = computed(() => {
    const q = this.bAttrSearchQuery().toLowerCase().trim();
    const added = new Set(this.addedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(
      a => !added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly bColInUse = computed(() =>
    1 + this.bColDefsInView().length + this.bAttrColsInView().length,
  );

  // ── Agency data computeds ──
  readonly allAgencies = computed(() => {
    const seen = new Set<string>();
    const list: Array<{ name: string; specialism: string; ranking: number; location: string; placements: number }> = [];
    for (const student of this.students()) {
      for (const a of [...student.queuedAgencyDetails, ...student.agencyDetails]) {
        if (!seen.has(a.name)) { seen.add(a.name); list.push(a); }
      }
    }
    return list;
  });

  readonly plannedAgenciesWithCounts = computed<PlannedAgencyCount[]>(() => {
    const countMap = new Map<string, number>();
    for (const student of this.students()) {
      for (const a of student.queuedAgencyDetails) {
        countMap.set(a.name, (countMap.get(a.name) ?? 0) + 1);
      }
    }
    return Array.from(countMap.entries()).map(([name, count]) => ({ name, count }));
  });

  readonly studentsByBlock = computed<BlockGroup[]>(() => {
    const blockMap = new Map<string, { period: string; detailMap: Map<string, Student[]> }>();
    for (const student of this.students()) {
      const block   = student.block   || 'Unassigned';
      const period  = student.period  || '';
      const details = student.details || 'General';
      if (!blockMap.has(block)) blockMap.set(block, { period, detailMap: new Map() });
      const { detailMap } = blockMap.get(block)!;
      if (!detailMap.has(details)) detailMap.set(details, []);
      detailMap.get(details)!.push(student);
    }
    return Array.from(blockMap.entries()).map(([block, { period, detailMap }]) => {
      const detailGroups = Array.from(detailMap.entries()).map(([details, studs]) => ({ details, students: studs }));
      return { block, period, count: detailGroups.reduce((s, g) => s + g.students.length, 0), detailGroups };
    });
  });

  readonly filteredAgencies = computed(() => {
    const search = this.searchText().toLowerCase();
    return this.allAgencies().filter(a => !search || a.name.toLowerCase().includes(search));
  });

  // ── Methods ──
  getErrefValue(agencyName: string, attrId: string): string {
    return this.errefData[agencyName]?.[attrId] ?? '—';
  }

  getAttrName(attrId: string): string {
    return this.getBCustomAttrLabel(attrId);
  }

  getState(agencyName: string): string {
    return this.agencyStates()[agencyName] ?? 'none';
  }

  toggleSelect(agencyName: string): void {
    const current = this.getState(agencyName);
    this.agencyStates.update(map => ({ ...map, [agencyName]: current === 'selected' ? 'none' : 'selected' }));
  }

  toggleCol(key: ColKey): void {
    this.colVisibility.update(v => ({ ...v, [key]: !v[key] }));
  }

  addAttrColumn(attr: ErrefAttribute): void {
    if (this.bColInUse() >= this.bColLimit) return;
    this.addedAttrColumns.update(list => [...list, attr]);
    this.columnOrder.update(order => [...order, attr.id]);
    this.bAttrSearchQuery.set('');
  }

  removeAttrColumn(id: string): void {
    this.addedAttrColumns.update(list => list.filter(a => a.id !== id));
    this.columnOrder.update(order => order.filter(k => k !== id));
    this.hiddenAttrColumns.update(s => { const n = new Set(s); n.delete(id); return n; });
  }

  toggleAttrColumn(id: string): void {
    this.hiddenAttrColumns.update(s => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  openBColEdit(id: string): void {
    this.bColMenuEditItem.set({ type: 'attr', id });
    this.bColMenuEditLabel.set(this.bCustomAttrLabels()[id] ?? '');
  }

  closeBColEdit(): void {
    this.bColMenuEditItem.set(null);
    this.bColMenuEditLabel.set('');
  }

  saveBColEdit(): void {
    const item = this.bColMenuEditItem();
    if (!item) return;
    const label = this.bColMenuEditLabel().trim();
    this.bCustomAttrLabels.update(prev => ({ ...prev, [item.id]: label }));
    this.bColMenuEditItem.set(null);
    this.bColMenuEditLabel.set('');
  }

  getBCustomAttrLabel(id: string): string {
    const custom = this.bCustomAttrLabels()[id]?.trim();
    if (custom) return custom;
    return this.errefAttributes.find(a => a.id === id)?.name ?? id;
  }

  clearFilters(): void {
    this.searchText.set('');
    this.agencyType.set('');
    this.specialism.set('');
    this.categories.set('');
    this.integrationPartner.set('');
    this.groups.set('');
    this.hasPlacements.set(false);
  }

  onDocClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.baa-fp-col-menu') && !target.closest('.col-settings-btn')) {
      this.showColMenu.set(false);
      this.bColMenuEditItem.set(null);
    }
  }
}
