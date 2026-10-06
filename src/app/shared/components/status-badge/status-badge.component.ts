import { Component, computed, input } from '@angular/core';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  templateUrl: './status-badge.component.html',
})
export class StatusBadgeComponent {
  label = input.required<string>();
  tone = input<Tone>('muted');
}
