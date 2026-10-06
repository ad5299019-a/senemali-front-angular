import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {
  icon = input<string>('query_stats');
  iconBg = input<string>('var(--color-primary-50)');
  value = input<string | number>(0);
  label = input<string>('');
  detail = input<string>('');
}
