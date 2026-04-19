import { ImageAnnotatorClient } from '@google-cloud/vision';

const client = new ImageAnnotatorClient();

export async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
    const [result] = await client.documentTextDetection({ image: { content: buffer } });
    const fullText = result.fullTextAnnotation?.text ?? '';
    return fullText;
}

export function extractImeisFromText(text: string): string[] {
    // Matches IMEI-like sequences with optional label "IMEI"
    const imeiRegex = /\b(?:IMEI[:\s-]*)?([0-9]{14,16})\b/gi;
    const matches: string[] = [];
    let m;
    while ((m = imeiRegex.exec(text)) !== null) {
        if (m[1]) matches.push(m[1]);
    }
    // dedupe
    return Array.from(new Set(matches));
}

export async function extractImeisFromImageBuffer(buffer: Buffer): Promise<string[]> {
    const text = await extractTextFromBuffer(buffer);
    return extractImeisFromText(text);
}
