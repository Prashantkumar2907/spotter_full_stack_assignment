import { useCallback, useRef, useState } from 'react'
import { downloadSheetAsPng } from '../utils/exportSheet'

export function useSheetDownload(filename: string) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [exporting, setExporting] = useState(false)

  const download = useCallback(async () => {
    if (!svgRef.current) return
    setExporting(true)
    try {
      await downloadSheetAsPng(svgRef.current, filename)
    } finally {
      setExporting(false)
    }
  }, [filename])

  return { svgRef, exporting, download }
}
