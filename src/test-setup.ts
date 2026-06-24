// Must be first: makes Angular's JIT compiler available for TestBed
import '@angular/compiler'

import { getTestBed } from '@angular/core/testing'
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing'

getTestBed().initTestEnvironment(BrowserTestingModule, platformBrowserTesting())
