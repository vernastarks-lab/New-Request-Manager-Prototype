import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-request-summary',
  templateUrl: './request-summary.html',
  styleUrl: './request-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
})
export class RequestSummaryComponent {
  readonly studentsCount = input.required<number>();
  readonly blocksCount   = input.required<number>();
  readonly agenciesCount = input.required<number>();
  readonly requestsCount = input.required<number>();
  readonly isExpanded    = input<boolean>(false);
  readonly isClickable   = input<boolean>(false);

  readonly toggled = output<void>();
}
