import { ChangeDetectionStrategy, Component } from '@angular/core';

interface BlockStats {
  value: number;
  total?: number;
  color: string;
}

interface PlacementBlock {
  name: string;
  period: string;
  students: BlockStats;
  requests: BlockStats;
  placements: BlockStats;
}

@Component({
  selector: 'app-placement-blocks',
  templateUrl: './placement-blocks.html',
  styleUrl: './placement-blocks.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacementBlocksComponent {
  readonly blocks: PlacementBlock[] = [
    {
      name: 'Unassigned',
      period: 'Students without Placement Blocks',
      students:   { value: 0,  total: 0,  color: '#000' },
      requests:   { value: 0,             color: '#000' },
      placements: { value: 0,             color: '#000' },
    },
    {
      name: 'Feb Roster',
      period: '12/02/2024 to 24/02/2024',
      students:   { value: 11, total: 11, color: '#66cc66' },
      requests:   { value: 22,            color: '#66cc66' },
      placements: { value: 11,            color: '#66cc66' },
    },
    {
      name: 'Mar Roster',
      period: '04/03/2024 to 15/03/2024',
      students:   { value: 0,  total: 0,  color: '#000' },
      requests:   { value: 0,             color: '#000' },
      placements: { value: 0,             color: '#000' },
    },
    {
      name: 'Apr Roster',
      period: '08/04/2024 to 19/04/2024',
      students:   { value: 0,  total: 0,  color: '#000' },
      requests:   { value: 0,             color: '#000' },
      placements: { value: 0,             color: '#000' },
    },
  ];
}
