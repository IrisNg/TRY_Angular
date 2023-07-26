import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { DialogParentComponent } from 'src/app/shared/components/dialog/dialog-parent.component';

@Component({
  standalone: true,
  imports: [RouterModule, DialogParentComponent],
  selector: 'app-home',
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
