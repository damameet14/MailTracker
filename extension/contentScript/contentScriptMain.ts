import { GmailComposeWindowFinder } from './gmail/GmailComposeWindowFinder'
import { TrackingImageInjector } from './gmail/TrackingImageInjector'
import { MailTrackerSidebarController } from './sidebar/MailTrackerSidebarController'
import { MailTrackerSidebarElementFactory } from './sidebar/MailTrackerSidebarElementFactory'

const mailTrackerSidebarController = new MailTrackerSidebarController(
  new MailTrackerSidebarElementFactory(),
  new GmailComposeWindowFinder(),
  new TrackingImageInjector(),
)

mailTrackerSidebarController.toggleSidebar()
