import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

export type RuleResult = 'Pass' | 'Fail' | number;
export type RuleType = 'Criteria (all)' | 'Criteria (any)' | 'Score';

export interface RuleRow {
  ruleType: RuleType;
  ruleName: string;
  result: RuleResult;
  groupId?: string;
}

interface CriteriaItem  { label: string; pass: boolean; }
interface CriteriaGroup { mode: 'at-least-one' | 'all'; items: CriteriaItem[]; }

@Component({
  selector: 'app-match-breakdown',
  templateUrl: './match-breakdown.html',
  styleUrl: './match-breakdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatchBreakdownComponent {
  readonly ranking     = input<number>(95);
  readonly agencyName  = input<string>('');
  readonly studentName = input<string>('');

  readonly closed = output<void>();

  readonly expandedGroups = signal([false, false, false]);
  readonly rankingExpanded = signal(false);

  readonly headerTitle = computed(() => {
    const agency = this.agencyName();
    return agency ? `Score Breakdown · ${agency}` : 'Score Breakdown';
  });

  readonly criteriaGroups = computed<CriteriaGroup[]>(() => this.getCriteriaGroups());
  readonly rankingRules   = computed(() => this.getRankingRules(this.ranking()));

  toggleGroup(i: number): void {
    this.expandedGroups.update(arr => arr.map((v, idx) => idx === i ? !v : v));
  }

  toggleRanking(): void {
    this.rankingExpanded.update(v => !v);
  }

  private getCriteriaGroups(): CriteriaGroup[] {
    return [
      {
        mode: 'at-least-one',
        items: [
          { label: 'Edu-Prim/ECE Zone Preference 1', pass: true  },
          { label: 'Edu-Prim/ECE Zone Preference 2', pass: false },
          { label: 'Edu-Prim/ECE Zone Preference 3', pass: false },
        ],
      },
      {
        mode: 'all',
        items: [
          { label: 'Working with Children Check', pass: true },
          { label: 'Special Considerations',      pass: true },
        ],
      },
      {
        mode: 'at-least-one',
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
