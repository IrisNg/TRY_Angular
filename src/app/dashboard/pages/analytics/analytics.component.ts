import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'dashboard-analytics',
  templateUrl: 'analytics.component.html',
})
export class AnalyticsComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
