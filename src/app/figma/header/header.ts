import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  readonly navItems = [
    { label: 'Request', hasDropdown: true },
    { label: 'Placement', hasDropdown: true },
    { label: 'Manage', hasDropdown: true },
    { label: 'Advanced', hasDropdown: true },
    { label: 'Communication', hasDropdown: true },
    { label: 'Costing', hasDropdown: true },
    { label: 'Reports', hasDropdown: true },
    { label: 'More', hasDropdown: true },
  ];
}
