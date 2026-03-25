import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-placement-chart',
  templateUrl: './placement-chart.html',
  styleUrl: './placement-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlacementChartComponent {
  readonly total = 60;

  readonly segments = [
    { label: 'Placements Created', color: '#66cc66', value: 60, dashArray: '157 94.2', dashOffset: '-54.98' },
    { label: 'Confirmed Offers',   color: '#3399cc', value: 1,  dashArray: '3.93 247.27', dashOffset: '-51.05' },
    { label: 'Unconfirmed Offers', color: '#ffcc00', value: 2,  dashArray: '7.85 243.35', dashOffset: '-43.2' },
    { label: 'Not Yet Responded',  color: '#ff9933', value: 11, dashArray: '27.5 223.8',  dashOffset: '-15.7' },
    { label: 'Request In Draft',   color: '#999',    value: 5,  dashArray: '15.7 235.6',  dashOffset: '0' },
  ];
}
