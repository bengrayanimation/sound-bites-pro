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

export async function shareImage(title: string, blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'image/png' });
  
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ title, files: [file] });
      return true;
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        downloadFile(filename, blob);
      }
      return false;
    }
  } else {
    downloadFile(filename, blob);
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

// Quote card image generation
export interface QuoteCardStyle {
  bg: string;
  textColor: string;
  accentColor: string;
  label: string;
  gradient?: string;
}

export const quoteCardStyles: Record<string, QuoteCardStyle> = {
  minimal: {
    bg: '#FFFFFF',
    textColor: '#1a1a1a',
    accentColor: '#D4A574',
    label: 'Minimal',
  },
  bold: {
    bg: '#1a1a1a',
    textColor: '#FFFFFF',
    accentColor: '#D4A574',
    label: 'Bold',
  },
  corporate: {
    bg: '#1e293b',
    textColor: '#FFFFFF',
    accentColor: '#fbbf24',
    label: 'Corporate',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
  },
  student: {
    bg: '#fffbeb',
    textColor: '#1a1a1a',
    accentColor: '#D4A574',
    label: 'Student',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fed7aa 100%)',
  },
  ocean: {
    bg: '#0c4a6e',
    textColor: '#FFFFFF',
    accentColor: '#38bdf8',
    label: 'Ocean',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #164e63 100%)',
  },
  sunset: {
    bg: '#7c2d12',
    textColor: '#FFFFFF',
    accentColor: '#fb923c',
    label: 'Sunset',
    gradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 100%)',
  },
  forest: {
    bg: '#14532d',
    textColor: '#FFFFFF',
    accentColor: '#4ade80',
    label: 'Forest',
    gradient: 'linear-gradient(135deg, #14532d 0%, #166534 100%)',
  },
  lavender: {
    bg: '#581c87',
    textColor: '#FFFFFF',
    accentColor: '#c084fc',
    label: 'Lavender',
    gradient: 'linear-gradient(135deg, #581c87 0%, #6b21a8 100%)',
  },
};

export async function generateQuoteCardImage(
  quote: QuoteCard,
  styleKey: string = 'minimal'
): Promise<Blob> {
  const style = quoteCardStyles[styleKey] || quoteCardStyles.minimal;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Card dimensions (Instagram-friendly square)
  canvas.width = 1080;
  canvas.height = 1080;
  
  // Background
  if (style.gradient) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, style.bg);
    gradient.addColorStop(1, style.gradient.includes('#') ? style.gradient.split(' ').pop()!.replace(')', '') : style.bg);
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = style.bg;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Quote icon
  ctx.fillStyle = style.accentColor;
  ctx.font = 'bold 120px Georgia';
  ctx.fillText('"', 80, 180);
  
  // Quote text
  ctx.fillStyle = style.textColor;
  ctx.font = 'bold 48px "DM Sans", sans-serif';
  const words = quote.quote.split(' ');
  let line = '';
  let y = 350;
  const maxWidth = 920;
  const lineHeight = 70;
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line.trim(), 80, y);
      line = word + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), 80, y);
  
  // Closing quote
  ctx.fillStyle = style.accentColor;
  ctx.font = 'bold 120px Georgia';
  ctx.fillText('"', 920, y + 100);
  
  // Speaker info
  ctx.fillStyle = style.textColor;
  ctx.globalAlpha = 0.8;
  ctx.font = '600 32px "DM Sans", sans-serif';
  ctx.fillText(`— ${quote.speaker}`, 80, 920);
  
  // Timestamp
  ctx.globalAlpha = 0.5;
  ctx.font = '28px "DM Sans", sans-serif';
  ctx.fillText(formatTime(quote.timestamp), 80, 970);
  
  // Branding
  ctx.globalAlpha = 0.4;
  ctx.font = '24px "DM Sans", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SoundBites', 1000, 1040);
  
  ctx.globalAlpha = 1;
  
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png', 1);
  });
}

export async function downloadQuoteAsImage(quote: QuoteCard, style: string, filename: string) {
  const blob = await generateQuoteCardImage(quote, style);
  downloadFile(filename, blob);
}

export async function shareQuoteAsImage(quote: QuoteCard, style: string, title: string) {
  const blob = await generateQuoteCardImage(quote, style);
  return shareImage(title, blob, `${title.replace(/\s+/g, '_')}_quote.png`);
}