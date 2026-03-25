import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Rule {
  id: number;
  name: string;
  weight: number;
  active: boolean;
}

@Component({
  selector: 'app-trial-match-sheet',
  imports: [FormsModule],
  templateUrl: './trial-match-sheet.html',
  styleUrl: './trial-match-sheet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrialMatchSheetComponent {
  readonly studentCount = input<number>(0);
  readonly closed = output<void>();

  readonly autoQueue       = signal(false);
  readonly queueLimit      = signal(3);
  readonly selectedRuleset = signal('');
  readonly showSaveAsModal = signal(false);
  readonly saveAsName      = signal('');

  readonly rules = signal<Rule[]>([
    { id: 1, name: 'Specialism Match',       weight: 40, active: true  },
    { id: 2, name: 'Location Proximity',     weight: 30, active: true  },
    { id: 3, name: 'Placement Availability', weight: 20, active: true  },
    { id: 4, name: 'Previous Placements',    weight: 10, active: false },
  ]);

  readonly rulesets = ['Default Ruleset', 'Emergency Care Ruleset', 'Clinical Practice Ruleset'];

  readonly canRun = computed(() => this.selectedRuleset() !== '');

  private nextRuleId = 5;

  onOverlayWheel(event: WheelEvent): void {
    event.preventDefault();
    window.scrollBy({ left: event.deltaX, top: event.deltaY });
  }

  addRule(): void {
    const id = this.nextRuleId++;
    this.rules.update(list => [...list, { id, name: '', weight: 0, active: true }]);
  }

  removeRule(id: number): void {
    this.rules.update(list => list.filter(r => r.id !== id));
  }

  updateRuleName(id: number, name: string): void {
    this.rules.update(list => list.map(r => r.id === id ? { ...r, name } : r));
  }

  updateRuleWeight(id: number, weight: number): void {
    this.rules.update(list => list.map(r => r.id === id ? { ...r, weight } : r));
  }

  updateRuleActive(id: number, active: boolean): void {
    this.rules.update(list => list.map(r => r.id === id ? { ...r, active } : r));
  }

  openSaveAs(): void {
    this.saveAsName.set('');
    this.showSaveAsModal.set(true);
  }

  confirmSaveAs(): void {
    this.showSaveAsModal.set(false);
  }
}
