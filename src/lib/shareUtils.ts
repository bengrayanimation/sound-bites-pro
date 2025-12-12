import { TranscriptSegment, Summary, QuoteCard } from '@/types/recording';
import { formatTime } from './formatters';

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

export function downloadHtmlFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/html' });
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

// Generate attractive HTML document
export function generateTranscriptHtml(transcript: TranscriptSegment[], title: string): string {
  const segments = transcript.map(seg => `
    <div class="segment">
      <span class="timestamp">${formatTime(seg.startTime)}</span>
      ${seg.speaker ? `<span class="speaker">${seg.speaker}:</span>` : ''}
      <span class="text">${seg.text}</span>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Transcript</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e4e4e7;
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #D4A574, #c9956a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .meta { color: #a1a1aa; font-size: 0.875rem; }
    .segment {
      padding: 1rem;
      margin: 0.5rem 0;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      transition: background 0.2s;
    }
    .segment:hover { background: rgba(255, 255, 255, 0.06); }
    .timestamp {
      display: inline-block;
      font-family: 'SF Mono', Monaco, monospace;
      font-size: 0.75rem;
      color: #D4A574;
      background: rgba(212, 165, 116, 0.15);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      margin-right: 0.75rem;
    }
    .speaker {
      font-weight: 600;
      color: #f4f4f5;
      margin-right: 0.5rem;
    }
    .text { color: #d4d4d8; line-height: 1.6; }
    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: #71717a;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SoundBites</div>
      <h1>${title}</h1>
      <p class="meta">Transcript • ${transcript.length} segments</p>
    </div>
    ${segments}
    <div class="footer">
      Generated by SoundBites AI Voice Recorder
    </div>
  </div>
</body>
</html>`;
}

export function generateSummaryHtml(summary: Summary, title: string): string {
  const keyPoints = summary.executive.keyPoints.map(p => `<li>${p}</li>`).join('');
  const decisions = summary.executive.decisions.map(d => `<li>${d}</li>`).join('');
  const nextSteps = summary.executive.nextSteps.map((s, i) => `<li><span class="step-num">${i + 1}</span>${s}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - Summary</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e4e4e7;
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 2rem;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #D4A574, #c9956a);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }
    h1 { font-size: 1.75rem; font-weight: 600; margin-bottom: 0.5rem; }
    .meta { color: #a1a1aa; font-size: 0.875rem; }
    .section {
      margin: 1.5rem 0;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
    }
    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.125rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .icon { font-size: 1.25rem; }
    .key-points .icon { color: #D4A574; }
    .decisions .icon { color: #4ade80; }
    .next-steps .icon { color: #60a5fa; }
    ul { list-style: none; }
    li {
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #d4d4d8;
      line-height: 1.5;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    li:last-child { border-bottom: none; }
    li::before { content: none; }
    .key-points li::before { content: "📌"; margin-right: 0.5rem; }
    .decisions li::before { content: "✅"; margin-right: 0.5rem; }
    .step-num {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      background: #60a5fa;
      color: #1a1a2e;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .footer {
      text-align: center;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      color: #71717a;
      font-size: 0.75rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">SoundBites</div>
      <h1>${title}</h1>
      <p class="meta">Executive Summary</p>
    </div>
    <div class="section key-points">
      <h2 class="section-title"><span class="icon">📌</span> Key Points</h2>
      <ul>${keyPoints}</ul>
    </div>
    <div class="section decisions">
      <h2 class="section-title"><span class="icon">✅</span> Decisions Made</h2>
      <ul>${decisions}</ul>
    </div>
    <div class="section next-steps">
      <h2 class="section-title"><span class="icon">🎯</span> Next Steps</h2>
      <ul>${nextSteps}</ul>
    </div>
    <div class="footer">
      Generated by SoundBites AI Voice Recorder
    </div>
  </div>
</body>
</html>`;
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
  styleKey: string = 'minimal',
  backgroundImageUrl?: string
): Promise<Blob> {
  const style = quoteCardStyles[styleKey] || quoteCardStyles.minimal;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  
  // Card dimensions (Instagram-friendly square)
  canvas.width = 1080;
  canvas.height = 1080;
  
  // Background
  if (backgroundImageUrl) {
    // Load and draw background image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      img.onload = () => {
        // Draw image covering the canvas
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        // Add dark overlay for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = backgroundImageUrl;
    });
  } else if (style.gradient) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, style.bg);
    gradient.addColorStop(1, style.gradient.includes('#') ? style.gradient.split(' ').pop()!.replace(')', '') : style.bg);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = style.bg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  const textColor = backgroundImageUrl ? '#FFFFFF' : style.textColor;
  const accentColor = backgroundImageUrl ? '#FFFFFF' : style.accentColor;
  
  // Quote icon
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 120px Georgia';
  ctx.fillText('"', 80, 180);
  
  // Quote text
  ctx.fillStyle = textColor;
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
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 120px Georgia';
  ctx.fillText('"', 920, y + 100);
  
  // Speaker info
  ctx.fillStyle = textColor;
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

export async function downloadQuoteAsImage(quote: QuoteCard, style: string, filename: string, backgroundImageUrl?: string) {
  const blob = await generateQuoteCardImage(quote, style, backgroundImageUrl);
  downloadFile(filename, blob);
}

export async function shareQuoteAsImage(quote: QuoteCard, style: string, title: string, backgroundImageUrl?: string) {
  const blob = await generateQuoteCardImage(quote, style, backgroundImageUrl);
  return shareImage(title, blob, `${title.replace(/\s+/g, '_')}_quote.png`);
}
