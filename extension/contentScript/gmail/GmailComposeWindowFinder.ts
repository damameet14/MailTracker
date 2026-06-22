import type { GmailComposeWindow } from './GmailComposeWindow'

export class GmailComposeWindowFinder {
  findOpenComposeWindow(): GmailComposeWindow | null {
    const editableMessageBodyElement = this.findEditableMessageBodyElement()

    if (!editableMessageBodyElement) {
      return null
    }

    return {
      recipientEmailAddress: this.findRecipientEmailAddress(editableMessageBodyElement),
      emailSubject: this.findEmailSubject(),
      editableMessageBodyElement,
    }
  }

  private findEditableMessageBodyElement(): HTMLElement | null {
    return document.querySelector<HTMLElement>('div[aria-label="Message Body"][contenteditable="true"]')
  }

  private findRecipientEmailAddress(editableMessageBodyElement: HTMLElement): string {
    const composeDialogElement = editableMessageBodyElement.closest('[role="dialog"]') ?? document
    const recipientElement = composeDialogElement.querySelector<HTMLElement>('[email]')
    return recipientElement?.getAttribute('email') ?? ''
  }

  private findEmailSubject(): string {
    const subjectInputElement = document.querySelector<HTMLInputElement>('input[name="subjectbox"]')
    return subjectInputElement?.value.trim() ?? ''
  }
}
