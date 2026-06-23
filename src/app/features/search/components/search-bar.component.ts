import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  ViewChild,
} from '@angular/core'

import { TranslocoModule } from '@ngneat/transloco'

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './search-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBarComponent implements AfterViewInit {
  readonly initialValue = input<string>('')
  readonly search = output<string>()

  @ViewChild('searchInput') private searchInputRef!: ElementRef<HTMLInputElement>

  ngAfterViewInit(): void {
    const el = this.searchInputRef.nativeElement
    el.value = this.initialValue()
    el.focus()
  }

  onInput(event: Event): void {
    this.search.emit((event.target as HTMLInputElement).value)
  }

  onClear(): void {
    this.searchInputRef.nativeElement.value = ''
    this.search.emit('')
    this.searchInputRef.nativeElement.focus()
  }
}
