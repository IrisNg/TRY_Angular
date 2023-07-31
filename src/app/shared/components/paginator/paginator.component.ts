import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';

export interface PaginatorConfig {
  pageSize?: number;
  hasPrevNextArrows?: boolean;
  hasFirstLastArrows?: boolean;
  isShowDisabledArrows?: boolean;
  hasFirstLastPages?: boolean;
  maxVisiblePageNumbers?: 1 | 3 | 5;
  iconPrevArrow?: string;
  iconNextArrow?: string;
  iconFirstArrow?: string;
  iconLastArrow?: string;
}

type Config = Required<PaginatorConfig>;

const DEFAULT_CONFIG: Config = {
  pageSize: 20,
  hasPrevNextArrows: true,
  hasFirstLastArrows: false,
  isShowDisabledArrows: false,
  hasFirstLastPages: true,
  maxVisiblePageNumbers: 3,
  iconPrevArrow: 'keyboard_arrow_left',
  iconNextArrow: 'keyboard_arrow_right',
  iconFirstArrow: 'keyboard_double_arrow_left',
  iconLastArrow: 'keyboard_double_arrow_right',
};

enum PagesArrayComponentEnum {
  DOTS_TO_LAST = 'DOTS_TO_LAST',
  DOTS_TO_FIRST = 'DOTS_TO_FIRST',
  PREV_ARROW = 'PREV_ARROW',
  NEXT_ARROW = 'NEXT_ARROW',
  FIRST_ARROW = 'FIRST_ARROW',
  LAST_ARROW = 'LAST_ARROW',
  PREV_ARROW_DISABLED = 'PREV_ARROW_DISABLED',
  NEXT_ARROW_DISABLED = 'NEXT_ARROW_DISABLED',
}

type PagesArrayComponent = number | PagesArrayComponentEnum;
type PagesArray = PagesArrayComponent[];

export interface PageChangedEventData {
  pageNumber: number;
  pageSize: number;
}

@Component({
  standalone: true,
  selector: 'shared-paginator',
  templateUrl: 'paginator.component.html',
  imports: [MatIconModule, CommonModule],
})
export class PaginatorComponent implements OnInit, OnChanges {
  @Input('paginatorConfig') inputConfig?: PaginatorConfig;
  public config: Config = DEFAULT_CONFIG;

  public PagesArrayComponentEnum = PagesArrayComponentEnum;

  @Input() pageNumber: number = 1;
  // Pass in totalItemsCount(recommended) OR numberOfPages
  // If totalItemsCount is passed in, numberOfPages will be auto-calculated using totalItemsCount and pageSize
  @Input() totalItemsCount: number = 0;
  @Input() numberOfPages?: number;

  @Output() pageChanged = new EventEmitter<PageChangedEventData>();

  // Calculated properties
  public pagesArray: PagesArray = [];
  public lastPageNumber: number = 0;

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    const inputConfig = changes['inputConfig'];
    if (
      inputConfig?.currentValue &&
      inputConfig?.currentValue != inputConfig?.previousValue
    ) {
      this.setConfig();
    }

    const pageNumber = changes['pageNumber'];
    const totalItemsCount = changes['totalItemsCount'];
    const numberOfPages = changes['numberOfPages'];

    const hasPageNumberChange =
      pageNumber?.currentValue &&
      pageNumber?.currentValue != pageNumber?.previousValue;
    const hasTotalItemsCountChange =
      totalItemsCount?.currentValue &&
      totalItemsCount?.currentValue != totalItemsCount?.previousValue;
    const hasPageSizeChange =
      inputConfig?.currentValue?.pageSize &&
      inputConfig?.currentValue?.pageSize !=
        inputConfig?.previousValue?.pageSize;
    const hasNumberOfPagesChange =
      numberOfPages?.currentValue &&
      numberOfPages?.currentValue != numberOfPages?.previousValue;

    if (
      hasPageNumberChange ||
      hasNumberOfPagesChange ||
      hasTotalItemsCountChange ||
      hasPageSizeChange
    ) {
      this.generatePagesArray();
    }
  }

  onPageChange(pageNumber: number) {
    this.pageChanged.emit({ pageNumber, pageSize: this.config.pageSize });
  }

  private setConfig() {
    // Fill in missing config options with defaults
    this.config = { ...DEFAULT_CONFIG, ...(this.inputConfig ?? {}) };
  }

  isPageNumber(pagesArrayComponent: PagesArrayComponent) {
    return typeof pagesArrayComponent === 'number';
  }

  castToNumber(pagesArrayComponent: PagesArrayComponent): number {
    return Number(pagesArrayComponent);
  }

  private generatePagesArray() {
    const pageNumber = this.pageNumber;
    const lastPageNumber =
      this.numberOfPages ??
      Math.ceil(this.totalItemsCount / this.config.pageSize);

    // Prevent pageNumber from exceeding lastPageNumber
    if (pageNumber > lastPageNumber) {
      this.onPageChange(lastPageNumber);
    }

    const { hasPrevNextArrows, hasFirstLastArrows, hasFirstLastPages } =
      this.config;

    let pagesArray: PagesArray = [pageNumber];

    // generate array of neighboring page numbers before and after pageNumber
    pagesArray = this.addNeighbourPageNumbers(
      pagesArray,
      lastPageNumber,
      pageNumber
    );

    if (hasFirstLastPages) {
      pagesArray = this.addFirstLastPages(pagesArray, lastPageNumber);
    }

    if (hasPrevNextArrows) {
      pagesArray = this.addPrevNextArrows(
        pagesArray,
        lastPageNumber,
        pageNumber
      );
    }

    if (hasFirstLastArrows) {
      pagesArray = this.addFirstLastArrows(
        pagesArray,
        lastPageNumber,
        pageNumber
      );
    }

    console.log(pagesArray, this.pagesArray);
    this.lastPageNumber = lastPageNumber;
    this.pagesArray = pagesArray;
  }

  // Generate an array of page numbers based on the pageNumber and maxVisiblePageNumbers
  // Eg. if maxVisiblePageNumbers is 5, and pageNumber is 5 -> [3,4,5,6,7]
  // or if pageNumber is 3 ->[1,2,3,4,5]
  private addNeighbourPageNumbers(
    pagesArray: PagesArray,
    lastPageNumber: number,
    pageNumber: number
  ) {
    let newPagesArray: PagesArray = [...pagesArray];

    let nextNum = pageNumber + 1;
    let prevNum = pageNumber - 1;

    while (newPagesArray.length < this.config.maxVisiblePageNumbers) {
      if (nextNum <= lastPageNumber) {
        newPagesArray.push(nextNum);
        nextNum++;
      }
      if (prevNum >= 1) {
        newPagesArray.unshift(prevNum);
        prevNum--;
      }
      if (newPagesArray.length === lastPageNumber) {
        break;
      }
    }

    return newPagesArray;
  }

  private addFirstLastPages(pagesArray: PagesArray, lastPageNumber: number) {
    let newPagesArray: PagesArray = [...pagesArray];

    // Add last page number to pagesArray if applicable
    const lastDifference =
      lastPageNumber - (pagesArray[pagesArray.length - 1] as number);

    if (lastDifference > 1) {
      // There are other page(s) between last page number and last pagesArray element
      newPagesArray = [
        ...newPagesArray,
        PagesArrayComponentEnum.DOTS_TO_LAST,
        lastPageNumber,
      ];
    } else if (lastDifference === 1) {
      // last pagesArray element is not last page number and there are no other page(s) between them
      newPagesArray = [...newPagesArray, lastPageNumber];
    }

    // Add page 1 to pagesArray if applicable
    const startDifference = (pagesArray[0] as number) - 1;

    if (startDifference > 1) {
      // There are other page(s) between first page and first pagesArray element
      newPagesArray = [
        1,
        PagesArrayComponentEnum.DOTS_TO_FIRST,
        ...newPagesArray,
      ];
    } else if (startDifference === 1) {
      // first pagesArray element is not first page and there are no other page(s) between them
      newPagesArray = [1, ...newPagesArray];
    }

    return newPagesArray;
  }

  // Add Next or Previous arrow if valid
  private addPrevNextArrows(
    pagesArray: PagesArray,
    lastPageNumber: number,
    pageNumber: number
  ) {
    let newPagesArray: PagesArray = [...pagesArray];

    if (pageNumber < lastPageNumber) {
      newPagesArray = [...newPagesArray, PagesArrayComponentEnum.NEXT_ARROW];
    } else if (this.config.isShowDisabledArrows) {
      newPagesArray = [
        ...newPagesArray,
        PagesArrayComponentEnum.NEXT_ARROW_DISABLED,
      ];
    }

    if (pageNumber > 1) {
      newPagesArray = [PagesArrayComponentEnum.PREV_ARROW, ...newPagesArray];
    } else if (this.config.isShowDisabledArrows) {
      newPagesArray = [
        PagesArrayComponentEnum.PREV_ARROW_DISABLED,
        ...newPagesArray,
      ];
    }

    return newPagesArray;
  }

  // Add skip to last or first page arrow if valid
  private addFirstLastArrows(
    pagesArray: PagesArray,
    lastPageNumber: number,
    pageNumber: number
  ) {
    let newPagesArray: PagesArray = [...pagesArray];

    if (pageNumber < lastPageNumber) {
      newPagesArray = [...newPagesArray, PagesArrayComponentEnum.LAST_ARROW];
    }

    if (pageNumber > 1) {
      newPagesArray = [PagesArrayComponentEnum.FIRST_ARROW, ...newPagesArray];
    }

    return newPagesArray;
  }
}
