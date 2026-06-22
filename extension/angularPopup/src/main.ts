import { provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { PopupComponent } from './app/PopupComponent'

bootstrapApplication(PopupComponent, {
  providers: [provideZonelessChangeDetection()],
}).catch((error: unknown) => {
  console.error('MailTracker popup failed to start', error)
})
