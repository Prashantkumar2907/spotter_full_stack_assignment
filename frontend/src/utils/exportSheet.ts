const EXPORT_SCALE = 2
const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'

function serialize(svg: SVGSVGElement, width: number, height: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', SVG_NAMESPACE)
  clone.setAttribute('width', String(width))
  clone.setAttribute('height', String(height))
  clone.querySelectorAll('.sheet-reveal').forEach((node) => node.removeAttribute('class'))
  return new XMLSerializer().serializeToString(clone)
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('The log sheet could not be rendered as an image'))
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('PNG export failed'))), 'image/png')
  })
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export async function downloadSheetAsPng(svg: SVGSVGElement, filename: string): Promise<void> {
  const box = svg.viewBox.baseVal
  const width = box.width * EXPORT_SCALE
  const height = box.height * EXPORT_SCALE
  const markup = serialize(svg, width, height)
  const svgUrl = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  try {
    const image = await loadImage(svgUrl)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is not available in this browser')
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)
    triggerDownload(await canvasToBlob(canvas), filename)
  } finally {
    URL.revokeObjectURL(svgUrl)
  }
}
