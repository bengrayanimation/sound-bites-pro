import { Recording, TranscriptSegment, Summary, QuoteCard } from '@/types/recording';
import { formatTime, formatDuration } from './formatters';

export async function shareText(title: string, text: string) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        fallbackCopy(text);
      }
      return false;
    }
  } else {
    fallbackCopy(text);
    return true;
  }
}

export function fallbackCopy(text: string) {
  navigator.clipboard.writeText(text);
}

export function generateTranscriptText(transcript: TranscriptSegment[]): string {
  return transcript
    .map((seg) => `[${formatTime(seg.startTime)}] ${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}`)
    .join('\n');
}

export function generateSummaryText(summary: Summary, title: string): string {
  let text = `📋 Summary: ${title}\n\n`;
  
  text += '📌 KEY POINTS\n';
  summary.executive.keyPoints.forEach((p) => (text += `• ${p}\n`));
  
  text += '\n✅ DECISIONS\n';
  summary.executive.decisions.forEach((d) => (text += `• ${d}\n`));
  
  text += '\n🎯 NEXT STEPS\n';
  summary.executive.nextSteps.forEach((s, i) => (text += `${i + 1}. ${s}\n`));
  
  return text;
}

export function generateQuoteText(quote: QuoteCard): string {
  return `"${quote.quote}"\n— ${quote.speaker} (${formatTime(quote.timestamp)})`;
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadFile(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
