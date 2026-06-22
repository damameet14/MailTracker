export class MailTrackerSidebarElementFactory {
  createHostElement(): HTMLElement {
    const hostElement = document.createElement('aside')
    hostElement.id = 'mailtracker-sidebar-host'
    Object.assign(hostElement.style, {
      position: 'fixed',
      right: '0',
      top: '82px',
      zIndex: '2147483647',
    })
    return hostElement
  }

  createSidebarShell(closeSidebar: () => void, prepareCurrentCompose: () => void): HTMLElement {
    const shellElement = this.createElement('section', undefined, 'mailtracker-shell')
    shellElement.append(
      this.createPullerButton(shellElement),
      this.createSidebarPanel(closeSidebar, prepareCurrentCompose),
    )
    return shellElement
  }

  createStatusElement(message: string): HTMLElement {
    const statusElement = this.createElement('p', message, 'mailtracker-status')
    statusElement.setAttribute('aria-live', 'polite')
    return statusElement
  }

  private createPullerButton(shellElement: HTMLElement): HTMLButtonElement {
    const pullerButtonElement = this.createButton('MailTracker', () => {
      shellElement.classList.toggle('mailtracker-collapsed')
    }, 'mailtracker-puller')
    pullerButtonElement.setAttribute('aria-label', 'Toggle MailTracker sidebar')
    return pullerButtonElement
  }

  private createSidebarPanel(closeSidebar: () => void, prepareCurrentCompose: () => void): HTMLElement {
    const panelElement = this.createElement('section', undefined, 'mailtracker-panel')
    panelElement.append(
      this.createHeader(closeSidebar),
      this.createContactSummary(),
      this.createActionButton('+', 'Prepare current compose', prepareCurrentCompose, 'mailtracker-primary-action'),
      this.createActionButton('✉', 'Send tracked email', prepareCurrentCompose),
      this.createActionButton('↗', 'Open detected history', () => undefined),
      this.createActionButton('⌕', 'Find work email', () => undefined),
      this.createElement('p', 'MailTracker reports tracking image loaded events only.', 'mailtracker-notice'),
      this.createStatusElement('Open a Gmail compose window to begin.'),
    )
    return panelElement
  }

  private createHeader(closeSidebar: () => void): HTMLElement {
    const headerElement = this.createElement('div', undefined, 'mailtracker-header')
    const brandWrapElement = this.createElement('div', undefined, 'mailtracker-brand-wrap')
    const logoElement = document.createElement('img')
    logoElement.className = 'mailtracker-logo'
    logoElement.src = chrome.runtime.getURL('logo.png')
    logoElement.alt = ''
    brandWrapElement.append(logoElement, this.createElement('div', 'MailTracker', 'mailtracker-brand'))
    const closeButtonElement = this.createButton('−', closeSidebar, 'mailtracker-close-button')
    closeButtonElement.setAttribute('aria-label', 'Collapse MailTracker sidebar')
    headerElement.append(brandWrapElement, closeButtonElement)
    return headerElement
  }

  private createContactSummary(): HTMLElement {
    const summaryElement = this.createElement('section', undefined, 'mailtracker-summary')
    summaryElement.append(
      this.createElement('strong', 'Gmail Compose', 'mailtracker-summary-title'),
      this.createElement('span', 'Prepare a tracking image before sending from Gmail.', 'mailtracker-summary-copy'),
    )
    return summaryElement
  }

  private createActionButton(
    iconLabel: string,
    label: string,
    action: () => void,
    className = 'mailtracker-action',
  ): HTMLElement {
    const buttonElement = this.createButton('', action, className)
    buttonElement.append(
      this.createElement('span', iconLabel, 'mailtracker-action-icon'),
      this.createElement('span', label, 'mailtracker-action-label'),
    )
    return buttonElement
  }

  private createButton(label: string, action: () => void, className: string): HTMLButtonElement {
    const buttonElement = document.createElement('button')
    buttonElement.type = 'button'
    buttonElement.textContent = label
    buttonElement.className = className
    buttonElement.addEventListener('click', action)
    return buttonElement
  }

  private createElement(tagName: string, textContent?: string, className?: string): HTMLElement {
    const element = document.createElement(tagName)
    if (textContent !== undefined) element.textContent = textContent
    if (className !== undefined) element.className = className
    return element
  }
}
