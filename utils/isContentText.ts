type MessageContentBlock = {
  type: string
  text?: {
    value: string
  }
}

export function isContentText(block: MessageContentBlock): boolean {
  return block.type === 'text' && !!block.text?.value
}
