import { TextractClient, AnalyzeDocumentCommand, FeatureType } from '@aws-sdk/client-textract'

function getTextract(): TextractClient {
  return new TextractClient({
    region: process.env.AWS_TEXTRACT_REGION ?? 'eu-west-2',
    credentials: {
      accessKeyId:     process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })
}

export interface ExtractedDocumentData {
  rawText:         string
  keyValues:       Record<string, string>
  confidence:      number
  detectedDates:   string[]
  detectedAmounts: string[]
  detectedRefs:    string[]
}

export async function extractDocument(s3Bucket: string, s3Key: string): Promise<ExtractedDocumentData> {
  const result = await getTextract().send(new AnalyzeDocumentCommand({
    Document:     { S3Object: { Bucket: s3Bucket, Name: s3Key } },
    FeatureTypes: [FeatureType.FORMS, FeatureType.TABLES],
  }))

  const blocks = result.Blocks ?? []

  const rawText = blocks
    .filter(b => b.BlockType === 'LINE' && b.Text)
    .map(b => b.Text!)
    .join('\n')

  const keyValues: Record<string, string> = {}
  const keyBlocks = blocks.filter(
    b => b.BlockType === 'KEY_VALUE_SET' && b.EntityTypes?.includes('KEY')
  )
  for (const keyBlock of keyBlocks) {
    const keyText = getTextFromBlock(keyBlock, blocks)
    const valueBlockId = keyBlock.Relationships?.find(r => r.Type === 'VALUE')?.Ids?.[0]
    if (valueBlockId) {
      const valueBlock = blocks.find(b => b.Id === valueBlockId)
      if (valueBlock) {
        const valueText = getTextFromBlock(valueBlock, blocks)
        if (keyText && valueText) keyValues[keyText] = valueText
      }
    }
  }

  const lineBlocks = blocks.filter(b => b.BlockType === 'LINE' && b.Confidence)
  const avgConfidence = lineBlocks.length > 0
    ? lineBlocks.reduce((sum, b) => sum + (b.Confidence ?? 0), 0) / lineBlocks.length / 100
    : 0

  const dateRegex   = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b/gi
  const amountRegex = /£[\d,]+(?:\.\d{2})?(?:\s*(?:million|m|bn|billion))?/gi
  const refRegex    = /\b(?:policy|ref|certificate|card|registration|number|no\.?|#)\s*:?\s*([A-Z0-9\-\/]{5,20})\b/gi

  const detectedDates: string[]   = []
  const detectedAmounts: string[] = []
  const detectedRefs: string[]    = []

  let m: RegExpExecArray | null
  while ((m = dateRegex.exec(rawText))   !== null) detectedDates.push(m[0])
  while ((m = amountRegex.exec(rawText)) !== null) detectedAmounts.push(m[0])
  while ((m = refRegex.exec(rawText))    !== null) detectedRefs.push(m[1])

  return {
    rawText,
    keyValues,
    confidence:      Math.round(avgConfidence * 1000) / 1000,
    detectedDates:   Array.from(new Set(detectedDates)),
    detectedAmounts: Array.from(new Set(detectedAmounts)),
    detectedRefs:    Array.from(new Set(detectedRefs)),
  }
}

function getTextFromBlock(block: any, allBlocks: any[]): string {
  const wordIds: string[] = block.Relationships
    ?.filter((r: any) => r.Type === 'CHILD')
    ?.flatMap((r: any) => r.Ids ?? []) ?? []
  return wordIds
    .map((id: string) => allBlocks.find(b => b.Id === id)?.Text ?? '')
    .join(' ')
    .trim()
}

export function inferExpiryDate(data: ExtractedDocumentData): Date | null {
  const expiryKeywords = ['expiry', 'expires', 'valid until', 'expiration', 'renewal date', 'valid to']
  for (const [key, value] of Object.entries(data.keyValues)) {
    if (expiryKeywords.some(k => key.toLowerCase().includes(k))) {
      const parsed = parseExtractedDate(value)
      if (parsed) return parsed
    }
  }
  if (data.detectedDates.length > 0) {
    return parseExtractedDate(data.detectedDates[data.detectedDates.length - 1])
  }
  return null
}

function parseExtractedDate(raw: string): Date | null {
  const cleaned = raw.replace(/[^0-9a-zA-Z\s\/\-]/g, '').trim()
  const d = new Date(cleaned)
  return isNaN(d.getTime()) ? null : d
}
