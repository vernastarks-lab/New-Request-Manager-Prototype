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

  // ── Custom attribute columns (same pattern as add-agency-sheet) ──
  readonly attrMax           = 5;
  readonly attrRemaining     = computed(() => this.attrMax - this.addedAttrColumns().length);
  readonly openAttrOptionsId = signal<string | null>(null);
  readonly addedAttrColumns  = signal<ErrefAttribute[]>([]);
  readonly hiddenAttrColumns = signal<Set<string>>(new Set());
  readonly errefSearchQuery  = signal('');
  readonly showErrefSearch   = signal(false);

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
    { id: 'ERREF_4', name: 'Ambulance Victoria',  description: 'Metro or Rural classification assigned by Ambulance Victoria.' },
    { id: 'ERREF_5', name: 'NDIS Provider',        description: 'Indicates whether the agency is a registered NDIS provider.' },
    { id: 'ERREF_6', name: 'Partner Agreement',    description: 'Indicates whether a formal partner agreement is in place.' },
  ];

  readonly errefSearchResults = computed(() => {
    const q = this.errefSearchQuery().toLowerCase().trim();
    const added = new Set(this.addedAttrColumns().map(a => a.id));
    return this.errefAttributes.filter(
      a => !added.has(a.id) && (!q || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)),
    );
  });

  readonly errefData: Record<string, Record<string, string>> = {
    'Melbourne Emergency Services': { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'Royal Ambulance Victoria':     { ERREF_4: 'Rural', ERREF_5: 'No',  ERREF_6: 'Yes' },
    'City Medical Response Unit':   { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'No'  },
    'Northern Emergency Care':      { ERREF_4: 'Rural', ERREF_5: 'No',  ERREF_6: 'No'  },
    'Western Metro Ambulance':      { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'South Eastern Paramedic Services': { ERREF_4: 'Metro', ERREF_5: 'No', ERREF_6: 'Yes' },
    'Metropolitan Health Network':  { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
  };

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
    return this.attrMap().get(attrId)?.name ?? attrId;
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
    if (this.addedAttrColumns().length >= this.attrMax) return;
    this.addedAttrColumns.update(list => [...list, attr]);
    this.columnOrder.update(order => [...order, attr.id]);
    this.errefSearchQuery.set('');
    this.showErrefSearch.set(false);
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

  toggleAttrOptions(id: string): void {
    this.openAttrOptionsId.update(cur => cur === id ? null : id);
    this.showErrefSearch.set(false);
  }

  toggleErrefSearch(): void {
    this.showErrefSearch.update(v => !v);
    this.openAttrOptionsId.set(null);
    this.errefSearchQuery.set('');
  }

  moveColUp(id: string): void {
    this.columnOrder.update(order => {
      const i = order.indexOf(id);
      if (i <= 0) return order;
      const n = [...order];
      [n[i - 1], n[i]] = [n[i], n[i - 1]];
      return n;
    });
  }

  moveColDown(id: string): void {
    this.columnOrder.update(order => {
      const i = order.indexOf(id);
      if (i < 0 || i >= order.length - 1) return order;
      const n = [...order];
      [n[i], n[i + 1]] = [n[i + 1], n[i]];
      return n;
    });
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
    if (!target.closest('.col-menu-wrapper')) this.showColMenu.set(false);
    if (!target.closest('.erref-search-wrapper')) this.showErrefSearch.set(false);
    if (!target.closest('.attr-options-wrapper')) this.openAttrOptionsId.set(null);
  }
}
