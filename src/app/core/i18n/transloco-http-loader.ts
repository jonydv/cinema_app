import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'

import { Observable } from 'rxjs'

import { Translation, TranslocoLoader } from '@ngneat/transloco'

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient)

  getTranslation(lang: string): Observable<Translation> {
    return this.http.get<Translation>(`/i18n/${lang}.json`)
  }
}
