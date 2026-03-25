import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgencyDetail, Student } from '../models';

type ColKey = 'specialism' | 'ranking' | 'location' | 'plc';
interface ErrefAttribute { id: string; name: string; description?: string; }

interface CriteriaItem  { label: string; pass: boolean; }
interface CriteriaGroup { label: string; mode: 'at-least-one' | 'all'; pass: boolean; items: CriteriaItem[]; }

@Component({
  selector: 'app-add-agency-sheet',
  imports: [FormsModule],
  templateUrl: './add-agency-sheet.html',
  styleUrl: './add-agency-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'onDocClick($event)' },
})
export class AddAgencySheetComponent {
  readonly student         = input.required<Student>();
  readonly closed          = output<void>();
  readonly openTrialMatch  = output<void>();

  readonly searchText          = signal('');
  readonly agencyType          = signal('');
  readonly specialism          = signal('');
  readonly categories          = signal('');
  readonly integrationPartner  = signal('');
  readonly groups              = signal('');
  readonly hasPlacements       = signal(false);

  readonly showColMenu = signal(false);
  readonly colVisibility = signal<Record<ColKey, boolean>>({
    specialism: true,
    ranking:    true,
    location:   true,
    plc:        true,
  });

  // colspan = Agency + optional cols + Action + cogwheel col
  readonly visibleColCount = computed(() => {
    const v = this.colVisibility();
    return 3 + (v.specialism ? 1 : 0) + (v.ranking ? 1 : 0) + (v.location ? 1 : 0) + (v.plc ? 1 : 0);
  });

  readonly colDefs: { key: ColKey; label: string }[] = [
    { key: 'specialism', label: 'Specialism'  },
    { key: 'ranking',    label: 'Ranking'     },
    { key: 'location',   label: 'Location'    },
    { key: 'plc',        label: 'Plc (LY+TY)' },
  ];

  /* ── Custom attribute columns ── */
  private readonly stdColKeys = ['specialism', 'ranking', 'location', 'plc'] as const;

  readonly aaAttrMax          = 5;
  readonly aaAttrRemaining    = computed(() => this.aaAttrMax - this.aaAddedAttrColumns().length);
  readonly aaOpenAttrOptionsId = signal<string | null>(null);
  readonly aaAddedAttrColumns  = signal<ErrefAttribute[]>([]);
  readonly aaHiddenAttrColumns = signal<Set<string>>(new Set());
  readonly aaErrefSearchQuery  = signal('');
  readonly aaShowErrefSearch   = signal(false);

  /** Unified order: standard col keys + custom attr ids. */
  readonly aaColumnOrder = signal<string[]>(['specialism', 'ranking', 'location', 'plc']);

  readonly aaAttrMap = computed(() =>
    new Map(this.aaAddedAttrColumns().map(a => [a.id, a])),
  );

  readonly aaAttrColumnOrder = computed(() =>
    this.aaColumnOrder()
      .filter(k => !(this.stdColKeys as readonly string[]).includes(k))
      .map(id => this.aaAttrMap().get(id))
      .filter((a): a is ErrefAttribute => a !== undefined),
  );

  readonly aaErrefAttributes: ErrefAttribute[] = [
    { id: 'ERREF_4', name: 'Ambulance Victoria', description: 'Metro or Rural classification assigned by Ambulance Victoria for this agency' },
    { id: 'ERREF_5', name: 'NDIS Provider',      description: 'Indicates whether the agency is a registered NDIS provider' },
    { id: 'ERREF_6', name: 'Partner Agreement',  description: 'Indicates whether a formal partner agreement is in place with this agency' },
  ];

  readonly aaErrefSearchResults = computed(() => {
    const q = this.aaErrefSearchQuery().toLowerCase().trim();
    if (!q) return [] as ErrefAttribute[];
    const added = new Set(this.aaAddedAttrColumns().map(a => a.id));
    return this.aaErrefAttributes.filter(
      a => !added.has(a.id) && (a.id.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)),
    );
  });

  readonly aaErrefData: Record<string, Record<string, string>> = {
    'Melbourne Emergency Services':     { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'Royal Ambulance Victoria':         { ERREF_4: 'Rural', ERREF_5: '',    ERREF_6: 'Yes' },
    'Metropolitan Health Network':      { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: ''    },
    'City Medical Response Unit':       { ERREF_4: 'Rural', ERREF_5: '',    ERREF_6: ''    },
    'South Eastern Paramedic Services': { ERREF_4: 'Metro', ERREF_5: 'Yes', ERREF_6: 'Yes' },
    'Western Metro Ambulance':          { ERREF_4: 'Rural', ERREF_5: 'Yes', ERREF_6: ''    },
    'Northern Emergency Care':          { ERREF_4: 'Metro', ERREF_5: '',    ERREF_6: 'Yes' },
  };

  getAaErrefValue(agencyName: string, attrId: string): string {
    return this.aaErrefData[agencyName]?.[attrId] ?? '';
  }

  addAaAttrColumn(attr: ErrefAttribute): void {
    if (this.aaAddedAttrColumns().length >= this.aaAttrMax) return;
    this.aaAddedAttrColumns.update(cols => [...cols, attr]);
    this.aaColumnOrder.update(order => [...order, attr.id]);
    this.aaErrefSearchQuery.set('');
    this.aaShowErrefSearch.set(false);
  }

  removeAaAttrColumn(id: string): void {
    this.aaAddedAttrColumns.update(cols => cols.filter(a => a.id !== id));
    this.aaHiddenAttrColumns.update(s => { const next = new Set(s); next.delete(id); return next; });
    this.aaColumnOrder.update(order => order.filter(k => k !== id));
  }

  toggleAaAttrColumn(id: string): void {
    this.aaHiddenAttrColumns.update(s => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleAaAttrOptions(id: string): void {
    this.aaOpenAttrOptionsId.update(v => v === id ? null : id);
    this.aaShowErrefSearch.set(false);
  }

  toggleAaErrefSearch(): void {
    this.aaShowErrefSearch.update(v => !v);
    this.aaOpenAttrOptionsId.set(null);
  }

  moveAaColUp(id: string): void {
    this.aaColumnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx <= 0) return order;
      const next = [...order];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  moveAaColDown(id: string): void {
    this.aaColumnOrder.update(order => {
      const idx = order.indexOf(id);
      if (idx < 0 || idx >= order.length - 1) return order;
      const next = [...order];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  getAaAttrName(id: string): string {
    return this.aaAttrMap().get(id)?.name ?? id;
  }

  // per-agency state: queued default='planned', available default='none'
  readonly agencyStates = signal<Record<string, string>>({});

  // tracks agencies whose exclusion the user has manually removed
  readonly removedExclusions = signal<Set<string>>(new Set());

  readonly filteredQueued = computed(() => {
    const search = this.searchText().toLowerCase();
    return this.student().queuedAgencyDetails.filter(
      a => !search || a.name.toLowerCase().includes(search),
    );
  });

  readonly filteredAvailable = computed(() => {
    const search = this.searchText().toLowerCase();
    return this.student().agencyDetails.filter(
      a => !search || a.name.toLowerCase().includes(search),
    );
  });

  readonly totalCount = computed(
    () => this.filteredQueued().length + this.filteredAvailable().length,
  );

  // Score breakdown popover
  readonly breakdownState = signal<{
    agency: AgencyDetail;
    expandedGroups: boolean[];
    rankingExpanded: boolean;
  } | null>(null);

  readonly breakdownData = computed(() => {
    const s = this.breakdownState();
    if (!s) return null;
    return {
      agency:          s.agency,
      expandedGroups:  s.expandedGroups,
      rankingExpanded: s.rankingExpanded,
      criteriaGroups:  this.getCriteriaGroups(),
      rankingRules:    this.getRankingRules(s.agency.ranking),
    };
  });

  // Cursor-following tooltip for incompatible rows
  readonly cursorTooltip = signal<{ x: number; y: number; text: string } | null>(null);

  onIncompatibleMouseMove(e: MouseEvent, reason: string): void {
    this.cursorTooltip.set({ x: e.clientX, y: e.clientY, text: reason });
  }

  onIncompatibleMouseLeave(): void {
    this.cursorTooltip.set(null);
  }

  effectiveStatus(agency: AgencyDetail): 'excluded' | 'incompatible' | undefined {
    if (this.removedExclusions().has(agency.name)) return undefined;
    return agency.status;
  }

  onBanClick(agency: AgencyDetail): void {
    if (this.effectiveStatus(agency) === 'excluded') {
      this.removedExclusions.update(s => new Set([...s, agency.name]));
    }
  }

  getState(agencyName: string, isQueued: boolean): string {
    return this.agencyStates()[agencyName] ?? (isQueued ? 'planned' : 'none');
  }

  togglePlanned(agencyName: string, isQueued: boolean): void {
    const current = this.getState(agencyName, isQueued);
    this.agencyStates.update(map => ({
      ...map,
      [agencyName]: current === 'planned' ? 'none' : 'planned',
    }));
  }

  toggleCol(key: ColKey): void {
    this.colVisibility.update(v => ({ ...v, [key]: !v[key] }));
  }

  openBreakdown(agency: AgencyDetail): void {
    this.showColMenu.set(false);
    this.breakdownState.set({ agency, expandedGroups: [false, false, false], rankingExpanded: false });
  }

  closeBreakdown(): void {
    this.breakdownState.set(null);
  }

  toggleBreakdownGroup(idx: number): void {
    this.breakdownState.update(s =>
      s ? { ...s, expandedGroups: s.expandedGroups.map((v, i) => i === idx ? !v : v) } : null,
    );
  }

  toggleRanking(): void {
    this.breakdownState.update(s =>
      s ? { ...s, rankingExpanded: !s.rankingExpanded } : null,
    );
  }

  onOverlayWheel(event: WheelEvent): void {
    event.preventDefault();
    window.scrollBy({ left: event.deltaX, top: event.deltaY });
  }

  onDocClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.col-menu-wrapper')) {
      this.showColMenu.set(false);
      this.aaShowErrefSearch.set(false);
    }
    if (!target.closest('.aa-attr-options-wrapper')) {
      this.aaOpenAttrOptionsId.set(null);
    }
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

  private getCriteriaGroups(): CriteriaGroup[] {
    return [
      {
        label: 'Must pass at least one of these rules',
        mode:  'at-least-one',
        pass:  true,
        items: [
          { label: 'Edu-Prim/ECE Zone Preference 1', pass: true  },
          { label: 'Edu-Prim/ECE Zone Preference 2', pass: false },
          { label: 'Edu-Prim/ECE Zone Preference 3', pass: false },
        ],
      },
      {
        label: 'Must pass all of these rules',
        mode:  'all',
        pass:  true,
        items: [
          { label: 'Working with Children Check', pass: true },
          { label: 'Special Considerations',      pass: true },
        ],
      },
      {
        label: 'Must pass at least one of these rules',
        mode:  'at-least-one',
        pass:  true,
        items: [
          { label: 'Declaration 1', pass: true  },
          { label: 'Declaration 2', pass: false },
          { label: 'Declaration 3', pass: false },
          { label: 'Declaration 4', pass: false },
        ],
      },
    ];
  }

  private getRankingRules(total: number): { label: string; points: number; earned: boolean }[] {
    // Fixed rule values always sum to 100 at most.
    // Determine which rules are earned by greedy subtraction.
    let rem = total;
    const e1 = rem >= 60; if (e1) rem -= 60;
    const e2 = rem >= 30; if (e2) rem -= 30;
    const e3 = rem >= 10; if (e3) rem -= 10;
    return [
      { label: 'Distance (Route) > 10km', points: 60, earned: e1 },
      { label: 'Distance (Route) > 20km', points: 30, earned: e2 },
      { label: 'Distance (Route) > 40km', points: 10, earned: e3 },
    ];
  }
}
