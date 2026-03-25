import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

export type AttributeRowType = 'text' | 'select' | 'multiselect' | 'date' | 'checkbox' | 'file-combo';

@Component({
  selector: '[app-attribute-row]',
  imports: [FormsModule],
  templateUrl: './attribute-row.html',
  styleUrl: './attribute-row.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'attribute-row',
    '[class.attribute-row--editing]': 'isEditing()',
    tabindex: '0',
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
  },
})
export class AttributeRowComponent implements OnDestroy {
  private readonly el = inject(ElementRef);

  readonly label            = input.required<string>();
  readonly value            = input<unknown>(null);
  readonly required         = input<boolean>(false);
  readonly type             = input.required<AttributeRowType>();
  readonly description      = input<string>('');
  readonly options          = input<string[]>([]);
  readonly hasExpiry        = input<boolean>(false);
  readonly expiryValue      = input<string>('');
  readonly hasFileUpload    = input<boolean>(false);
  readonly fileValue        = input<File | null>(null);
  readonly multiSelectItems = input<string[]>([]);

  readonly valueChange          = output<unknown>();
  readonly expiryChange         = output<string>();
  readonly fileChange           = output<File | null>();
  readonly multiSelectChange    = output<string[]>();

  readonly isHovered        = signal(false);
  readonly isFocused        = signal(false);
  readonly showDropdown     = signal(false);
  readonly showTooltip      = signal(false);

  readonly isEditing = computed(
    () => this.isHovered() || this.isFocused() || this.showDropdown(),
  );

  private outsideHandler = (e: MouseEvent) => {
    if (this.showDropdown() && !this.el.nativeElement.contains(e.target)) {
      this.showDropdown.set(false);
      this.isFocused.set(false);
      this.isHovered.set(false);
    }
  };

  constructor() {
    document.addEventListener('mousedown', this.outsideHandler);
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.outsideHandler);
  }

  onMouseEnter(): void {
    if (!this.showDropdown()) this.isHovered.set(true);
  }

  onMouseLeave(): void {
    if (!this.showDropdown()) {
      this.isHovered.set(false);
      this.isFocused.set(false);
    }
  }

  onFocus(): void { this.isFocused.set(true); }

  onBlur(): void {
    if (!this.showDropdown()) {
      this.isFocused.set(false);
      this.isHovered.set(false);
    }
  }

  toggleDropdown(): void { this.showDropdown.update(v => !v); }

  toggleMultiItem(item: string, checked: boolean): void {
    const current = this.multiSelectItems();
    const next = checked
      ? [...current, item]
      : current.filter(i => i !== item);
    this.multiSelectChange.emit(next);
  }

  get displayValue(): string {
    const t = this.type();
    if (t === 'multiselect' || t === 'file-combo') {
      return this.multiSelectItems().join(', ');
    }
    if (t === 'checkbox') return this.value() ? 'Yes' : '';
    return (this.value() as string) ?? '';
  }

  get availableOptions(): string[] {
    return this.options().filter(o => !this.multiSelectItems().includes(o));
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.fileChange.emit(file);
  }
}
