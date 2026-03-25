import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RequestManagerComponent } from './figma/request-manager/request-manager';

@Component({
  selector: 'app-root',
  imports: [RequestManagerComponent],
  template: '<app-request-manager />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
