import { ChangeDetectionStrategy, Component, effect, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface BlockDates {
  start: string;
  end: string;
}

@Component({
  selector: 'app-request-details',
  imports: [FormsModule],
  templateUrl: './request-details.html',
  styleUrl: './request-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class RequestDetailsComponent {
  readonly experience     = input<string>('');
  readonly duration       = input<string>('');
  readonly unitOfMeasure  = input<string>('Hour');
  readonly selectedBlocks = input<string[]>(['Feb Roster', 'March Roster', 'April Roster']);

  readonly availableExperiences = ['On-Road Emergency', 'General', 'Clinical Practice'];
  readonly availableSpecialisms = [
    'Critical Care', 'Emergency Medicine', 'Pediatrics', 'Mental Health', 'Community Care',
  ];

  readonly isOverrideMode           = signal(false);
  readonly isPlacementOverrideMode  = signal(false);
  readonly selectedExperiences      = signal<string[]>([]);
  readonly currentSelection         = signal('');
  readonly selectedSpecialisms      = signal<string[]>([]);
  readonly currentSpecialismSel     = signal('');
  readonly overridePlacementDates   = signal<BlockDates>({ start: '', end: '' });
  readonly blockDates               = signal<Record<string, BlockDates>>({});

  readonly hideStudentDetails       = signal(false);
  readonly notFlexibleDates         = signal(false);
  readonly notFlexibleExperience    = signal(false);
  readonly activityText             = signal('');
  readonly commentText              = signal('');
  readonly durationValue            = signal('');
  readonly unitOfMeasureValue       = signal('Hour');

  constructor() {
    effect(() => {
      const blocks = this.selectedBlocks();
      const current = untracked(() => this.blockDates());
      const next: Record<string, BlockDates> = {};
      blocks.forEach(block => {
        next[block] = current[block] ?? this.getDefaultDates(block);
      });
      this.blockDates.set(next);
    });
  }

  private getDefaultDates(blockName: string): BlockDates {
    if (blockName.includes('Feb')) return { start: '2024-02-12', end: '2024-02-24' };
    if (blockName.includes('Mar')) return { start: '2024-03-04', end: '2024-03-15' };
    if (blockName.includes('Apr')) return { start: '2024-04-08', end: '2024-04-19' };
    return { start: '2024-02-12', end: '2024-02-24' };
  }

  addExperience(exp: string): void {
    if (exp && !this.selectedExperiences().includes(exp)) {
      this.selectedExperiences.update(list => [...list, exp]);
    }
    this.currentSelection.set('');
  }

  removeExperience(exp: string): void {
    this.selectedExperiences.update(list => list.filter(e => e !== exp));
  }

  addSpecialism(spec: string): void {
    if (spec && !this.selectedSpecialisms().includes(spec)) {
      this.selectedSpecialisms.update(list => [...list, spec]);
    }
    this.currentSpecialismSel.set('');
  }

  removeSpecialism(spec: string): void {
    this.selectedSpecialisms.update(list => list.filter(s => s !== spec));
  }

  setOverrideDateField(field: 'start' | 'end', value: string): void {
    this.overridePlacementDates.update(d => ({ ...d, [field]: value }));
  }

  setBlockDateField(blockName: string, field: 'start' | 'end', value: string): void {
    this.blockDates.update(d => ({
      ...d,
      [blockName]: { ...d[blockName], [field]: value },
    }));
  }

  get sortedExperiences(): string[] {
    return [...this.availableExperiences].sort();
  }

  get sortedSpecialisms(): string[] {
    return [...this.availableSpecialisms].sort();
  }
}
