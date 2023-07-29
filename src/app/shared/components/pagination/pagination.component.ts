import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';

export interface PaginationConfig {
  pageSize?: number;
  hasPrevNextArrows?: boolean;
  hasFirstLastArrows?: boolean;
  isShowDisabledArrows?: boolean;
  hasFirstLastPages?: boolean;
  maxVisiblePageNumbers?: number;
}

const DEFAULT_OPTIONS = {
  pageSize: 20,
  hasPrevNextArrows: true,
  hasFirstLastArrows: false,
  isShowDisabledArrows: false,
  hasFirstLastPages: true,
  maxVisiblePageNumbers: 3,
};

@Component({
  standalone: true,
  selector: 'shared-pagination',
  templateUrl: 'pagination.component.html',
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() paginationConfig?: PaginationConfig;
  public config?: Required<PaginationConfig>;

  @Input() pageNumber: number = 1;
  @Input() totalItemsCount: number = 0;
  public pageSize: number = DEFAULT_OPTIONS.pageSize;
  public numberOfPages: number = 0;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('simple changes in pagination', changes);
    // TODO: detect change and setConfig
    // if ((changes.firstChange) || (changes['currentValue']['paginationConfig'] != changes.previousValue?.paginationConfig))
  }

  setConfig() {
    // Fill in missing input options with defaults
    this.config = { ...DEFAULT_OPTIONS, ...(this.paginationConfig ?? {}) };
    this.pageSize = this.paginationConfig?.pageSize ?? DEFAULT_OPTIONS.pageSize;
  }
}
