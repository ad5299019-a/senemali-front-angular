import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard-priority-panel',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './dashboard-priority-panel.component.html',
  styleUrl: './dashboard-priority-panel.component.scss',
})
export class DashboardPriorityPanelComponent {
}
