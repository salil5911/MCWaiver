// Add proper types for SignaturePad
import type SignaturePad from "react-signature-canvas"

export type SignaturePadRef = SignaturePad & {
  clear: () => void
  getTrimmedCanvas: () => HTMLCanvasElement
  toDataURL: (type?: string) => string
  isEmpty: () => boolean
}

