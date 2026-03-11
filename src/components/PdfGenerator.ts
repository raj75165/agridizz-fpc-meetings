import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Meeting, Member, Resolution, Signature } from '../db/db';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.5;
  const maxChars = Math.floor(maxWidth / avgCharWidth);
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
}

export async function generateMeetingPdf(
  meeting: Meeting,
  members: Member[],
  resolutions: Resolution[],
  signatures: Signature[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  const green = rgb(0.1, 0.42, 0.23);
  const black = rgb(0, 0, 0);
  const gray = rgb(0.5, 0.5, 0.5);

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts: { size?: number; color?: ReturnType<typeof rgb>; bold?: boolean } = {}
  ) => {
    const { size = 11, color = black, bold = false } = opts;
    page.drawText(text, { x, y: yPos, size, font: bold ? boldFont : font, color });
  };

  const drawLine = (yPos: number) => {
    page.drawLine({
      start: { x: margin, y: yPos },
      end: { x: pageWidth - margin, y: yPos },
      thickness: 0.5,
      color: green,
    });
  };

  const newPage = () => {
    page = pdfDoc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };

  const checkY = (needed: number) => {
    if (y - needed < margin) newPage();
  };

  // Header
  drawText('AGRIDIZZ FPC', margin, y, { size: 20, bold: true, color: green });
  y -= 25;
  drawText('Meeting Minutes', margin, y, { size: 14, bold: true, color: green });
  y -= 10;
  drawLine(y);
  y -= 20;

  // Meeting info
  const typeLabels: Record<string, string> = { Annual: 'Annual General Meeting', Special: 'Special General Meeting', Board: 'Board Meeting' };
  drawText(typeLabels[meeting.type] || meeting.type, margin, y, { size: 13, bold: true });
  y -= 20;
  drawText(`Date: ${formatDate(meeting.date)}   Time: ${meeting.time}`, margin, y, { size: 11 });
  y -= 16;
  drawText(`Venue: ${meeting.venue}`, margin, y, { size: 11 });
  y -= 16;
  if (meeting.notes) {
    drawText(`Notes: ${meeting.notes}`, margin, y, { size: 10, color: gray });
    y -= 16;
  }
  y -= 10;
  drawLine(y);
  y -= 20;

  // Attendance
  const attendees = members.filter(m => meeting.attendeeIds.includes(m.id!));
  drawText('ATTENDANCE', margin, y, { size: 12, bold: true, color: green });
  y -= 18;
  if (attendees.length === 0) {
    drawText('No attendees recorded.', margin, y, { size: 10, color: gray });
    y -= 16;
  } else {
    for (const att of attendees) {
      checkY(16);
      drawText(`• ${att.name} (${att.role})`, margin + 10, y, { size: 10 });
      y -= 14;
    }
  }
  y -= 10;
  drawLine(y);
  y -= 20;

  // Resolutions
  const sorted = [...resolutions].sort((a, b) => a.order - b.order);
  drawText('RESOLUTIONS', margin, y, { size: 12, bold: true, color: green });
  y -= 18;

  if (sorted.length === 0) {
    drawText('No resolutions recorded.', margin, y, { size: 10, color: gray });
    y -= 16;
  } else {
    for (let i = 0; i < sorted.length; i++) {
      const res = sorted[i];
      checkY(60);

      drawText(`Resolution ${i + 1}`, margin, y, { size: 11, bold: true });
      y -= 16;

      // English
      const enLines = wrapText(res.titleEnglish, contentWidth, 10);
      for (const line of enLines) {
        checkY(14);
        drawText(line, margin + 10, y, { size: 10, bold: true });
        y -= 14;
      }
      const enTextLines = wrapText(res.textEnglish, contentWidth - 10, 10);
      for (const line of enTextLines) {
        checkY(13);
        drawText(line, margin + 10, y, { size: 10 });
        y -= 13;
      }
      y -= 8;

      // Hindi note (ASCII-safe)
      drawText(`(Hindi: ${res.titleHindi})`, margin + 10, y, { size: 9, color: gray });
      y -= 16;

      y -= 6;
    }
  }

  drawLine(y);
  y -= 20;

  // Signatures page
  const signatories = members.filter(m =>
    (m.role === 'Director' && meeting.attendeeIds.includes(m.id!)) ||
    meeting.signatureMemberIds.includes(m.id!)
  );

  checkY(40);
  drawText('SIGNATURES', margin, y, { size: 12, bold: true, color: green });
  y -= 18;

  for (const mem of signatories) {
    const sig = signatures.find(s => s.memberId === mem.id);
    checkY(80);

    drawText(`${mem.name} - ${mem.role}`, margin, y, { size: 10, bold: true });
    y -= 14;

    if (sig) {
      try {
        const base64 = sig.dataUrl.split(',')[1];
        const imgBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const img = await pdfDoc.embedPng(imgBytes);
        const dims = img.scale(0.3);
        const imgW = Math.min(dims.width, 180);
        const imgH = (imgW / dims.width) * dims.height;
        checkY(imgH + 20);
        page.drawImage(img, { x: margin, y: y - imgH, width: imgW, height: imgH });
        y -= imgH + 5;
        const sigDate = new Date(sig.signedAt).toLocaleString('en-IN');
        drawText(`Signed: ${sigDate}`, margin, y, { size: 8, color: gray });
        y -= 16;
      } catch {
        drawText('[Signature image error]', margin, y, { size: 9, color: gray });
        y -= 16;
      }
    } else {
      // Blank signature line
      page.drawLine({
        start: { x: margin, y: y - 10 },
        end: { x: margin + 200, y: y - 10 },
        thickness: 0.5,
        color: black,
      });
      y -= 30;
    }
    y -= 10;
  }

  // Footer on each page
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = pdfDoc.getPage(i);
    p.drawText(`Page ${i + 1} of ${pageCount}  |  Generated: ${new Date().toLocaleString('en-IN')}`, {
      x: margin,
      y: 20,
      size: 8,
      font,
      color: gray,
    });
  }

  return pdfDoc.save();
}
