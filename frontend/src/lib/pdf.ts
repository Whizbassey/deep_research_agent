// DOCX Export Function
import { Document as DocxDocument, Paragraph, TextRun, HeadingLevel, Packer, Table, TableCell, TableRow, WidthType, BorderStyle, VerticalAlign } from "docx";
import { saveAs } from "file-saver";

export interface Source {
  title: string;
  content: string;
  url?: string;
}

export interface SubagentResult {
  subtask: number;
  search_focus: string;
  sources: Source[];
}

export interface ComplexityAnalysis {
  complexity_score: number;
  num_subagents: number;
  explanation: string;
  estimated_sources: number;
}

export interface ResearchData {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
  complexity_analysis?: ComplexityAnalysis;
  model?: string;
  subagent_results?: SubagentResult[];
}

function parseMarkdownLine(line: string): { text: string; bold: boolean; italic: boolean }[] {
  const parts: { text: string; bold: boolean; italic: boolean }[] = [];
  let remaining = line;
  
  const patterns = [
    { regex: /\*\*(.+?)\*\*/, bold: true, italic: false },
    { regex: /__(.+?)__/, bold: true, italic: false },
    { regex: /\*(.+?)\*/, bold: false, italic: true },
    { regex: /_(.+?)_/, bold: false, italic: true },
    { regex: /`(.+?)`/, bold: false, italic: false, code: true }
  ];
  
  let lastIndex = 0;
  
  while (remaining.length > 0) {
    let earliestMatch: { index: number; length: number; text: string; bold: boolean; italic: boolean; code?: boolean } | null = null;
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.regex.source, 'g');
      regex.lastIndex = 0;
      const match = regex.exec(remaining);
      if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
        earliestMatch = {
          index: match.index,
          length: match[0].length,
          text: match[1],
          bold: pattern.bold,
          italic: pattern.italic,
          code: (pattern as any).code
        };
      }
    }
    
    if (earliestMatch && earliestMatch.index !== -1) {
      if (earliestMatch.index > 0) {
        parts.push({
          text: remaining.slice(0, earliestMatch.index),
          bold: false,
          italic: false
        });
      }
      parts.push({
        text: earliestMatch.text,
        bold: earliestMatch.bold,
        italic: earliestMatch.italic
      });
      remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
    } else {
      parts.push({ text: remaining, bold: false, italic: false });
      break;
    }
  }
  
  if (parts.length === 0) {
    parts.push({ text: line, bold: false, italic: false });
  }
  
  return parts;
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  // Check if line contains | characters and has content between them
  return trimmed.includes('|') && trimmed.split('|').filter(s => s.trim().length > 0).length >= 1;
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  
  // Check if the line consists mostly of |, -, :, and whitespace
  const content = trimmed.replace(/\|/g, '').replace(/[-:]/g, '').replace(/\s/g, '');
  return content.length === 0;
}

function parseTableRow(line: string): string[] {
  // Split by | and filter out empty cells
  return line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
}

function createTableCell(text: string, isHeader: boolean): TableCell {
  const parts = parseMarkdownLine(text);
  
  return new TableCell({
    children: [new Paragraph({
      children: parts.map(part => 
        new TextRun({
          text: part.text,
          bold: isHeader || part.bold,
          italics: part.italic,
          size: 22
        })
      ),
      spacing: { before: 100, after: 100 }
    })],
    shading: isHeader ? { fill: "F2F2F2" } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
    }
  });
}

type DocxElement = Paragraph | Table;

function parseSynthesisToDocx(text: string): DocxElement[] {
  const elements: DocxElement[] = [];
  const lines = text.split('\n');
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      i++;
      continue;
    }
    
    // Skip horizontal rules
    if (trimmed === '---' || trimmed === '***') {
      elements.push(new Paragraph({
        spacing: { before: 200, after: 200 }
      }));
      i++;
      continue;
    }
    
    // Handle tables
    if (isTableRow(trimmed) && !isTableSeparator(trimmed)) {
      const tableRows: TableRow[] = [];
      const headers = parseTableRow(trimmed);
      
      // Create header row
      const headerRow = new TableRow({
        children: headers.map(header => createTableCell(header, true))
      });
      tableRows.push(headerRow);
      
      // Move to next line
      i++;
      
      // Skip separator line
      if (i < lines.length && isTableSeparator(lines[i])) {
        i++;
      }
      
      // Collect data rows
      while (i < lines.length && isTableRow(lines[i]) && !isTableSeparator(lines[i])) {
        const cells = parseTableRow(lines[i]);
        const dataRow = new TableRow({
          children: cells.map(cell => createTableCell(cell, false))
        });
        tableRows.push(dataRow);
        i++;
      }
      
      // Create the table with proper width distribution
      elements.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }));
      continue;
    }
    
    // Handle headings
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s*/, '');
      elements.push(new Paragraph({
        text: headingText,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 300, after: 150 }
      }));
      i++;
      continue;
    }
    
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s*/, '');
      elements.push(new Paragraph({
        text: headingText,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 150 }
      }));
      i++;
      continue;
    }
    
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s*/, '');
      elements.push(new Paragraph({
        text: headingText,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      }));
      i++;
      continue;
    }
    
    // Handle bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s*/, '');
      const parts = parseMarkdownLine(bulletText);
      
      elements.push(new Paragraph({
        children: parts.map(part => 
          new TextRun({
            text: part.text,
            bold: part.bold,
            italics: part.italic,
            size: 22
          })
        ),
        bullet: { level: 0 },
        spacing: { before: 100, after: 100 }
      }));
      i++;
      continue;
    }
    
    // Handle numbered lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const listText = numberedMatch[2];
      const parts = parseMarkdownLine(listText);
      
      elements.push(new Paragraph({
        children: parts.map(part => 
          new TextRun({
            text: part.text,
            bold: part.bold,
            italics: part.italic,
            size: 22
          })
        ),
        numbering: {
          reference: "my-numbering",
          level: 0
        },
        spacing: { before: 100, after: 100 }
      }));
      i++;
      continue;
    }
    
    // Regular paragraph with markdown formatting
    const parts = parseMarkdownLine(trimmed);
    elements.push(new Paragraph({
      children: parts.map(part => 
        new TextRun({
          text: part.text,
          bold: part.bold,
          italics: part.italic,
          size: 22
        })
      ),
      spacing: { before: 120, after: 120, line: 360 }
    }));
    i++;
  }
  
  return elements;
}

export async function downloadResearchDocx(data: ResearchData) {
  const filenameSafeQuery = data.query.replace(/[^a-z0-9]+/gi, "_").replace(/_+/g, "_").toLowerCase();
  
  const doc = new DocxDocument({
    numbering: {
      config: [{
        reference: "my-numbering",
        levels: [{
          level: 0,
          format: "decimal",
          text: "%1.",
          style: {
            paragraph: {
              indent: { left: 720, hanging: 360 }
            }
          }
        }]
      }]
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        // Query as the main heading
        new Paragraph({
          text: data.query,
          heading: HeadingLevel.TITLE,
          spacing: { after: 400 }
        }),
        
        // Research synthesis content
        ...parseSynthesisToDocx(data.synthesis || "")
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `deep_research_${filenameSafeQuery}.docx`);
}
