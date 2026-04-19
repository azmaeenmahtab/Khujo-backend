/// <reference path="../../types/exif-parser.d.ts" />
import ExifParser from 'exif-parser';

export function extractExif(buffer: Buffer) {
  try {
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    return result.tags;
  } catch (err) {
    return null;
  }
}

export function analyzeExifTags(tags: Record<string, any>) {
  if (!tags) return { authentic: false, reason: 'No EXIF data found' };

  // Check for camera info
  const hasCamera = tags.Make || tags.Model;
  // Check for editing software
  const software = tags.Software ? tags.Software.toLowerCase() : '';
  const edited = software.includes('photoshop') || software.includes('gimp') || software.includes('editor');

  let reason = '';
  if (!hasCamera) reason += 'Missing camera info. ';
  if (edited) reason += `Editing software detected: ${tags.Software}.`;

  return {
    authentic: hasCamera && !edited,
    reason: reason.trim()
  };
}
