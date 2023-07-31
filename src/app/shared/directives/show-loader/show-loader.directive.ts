import {
  AfterContentInit,
  AfterViewInit,
  ComponentRef,
  ContentChild,
  Directive,
  ElementRef,
  Input,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { LoaderComponent } from '../../components/loader/loader.component';

@Directive({ standalone: true, selector: '[showLoader]' })
export class ShowLoaderDirective {
  // Optional child container to insert loader in
  @ContentChild('loaderPlaceholder', { read: ViewContainerRef })
  loaderPlaceholder?: ViewContainerRef;

  private loaderRef?: ComponentRef<LoaderComponent>;

  @Input() set isLoading(isLoading: boolean | null) {
    console.log('isloading', isLoading);
    if (isLoading) {
      this.loaderRef?.destroy();
      this.loaderRef = (
        this.loaderPlaceholder ?? this.vcr
      ).createComponent<LoaderComponent>(LoaderComponent);
    } else {
      this.loaderRef?.destroy();
    }
  }

  constructor(private vcr: ViewContainerRef) {}
}
