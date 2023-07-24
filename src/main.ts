import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { AppRoutingModule } from './app/app-routing.module';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

bootstrapApplication(AppComponent, {
  providers: [importProvidersFrom(AppRoutingModule), provideNoopAnimations()],
});
