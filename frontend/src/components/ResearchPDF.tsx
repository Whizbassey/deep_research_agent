import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from "file-saver";

interface Source {
  title: string;
  content: string;
  url?: string;
}

interface SubagentResult {
  subtask: number;
  search_focus: string;
  sources: Source[];
}

interface ComplexityAnalysis {
  complexity_score: number;
  num_subagents: number;
  explanation: string;
  estimated_sources: number;
}

interface ResearchData {
  query: string;
  subagents: number;
  total_sources: number;
  synthesis: string;
  complexity_analysis?: ComplexityAnalysis;
  model?: string;
  subagent_results?: SubagentResult[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#000000',
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 14,
    marginBottom: 10,
    color: '#000000',
  },
  heading3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    color: '#000000',
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#000000',
  },
  bulletPoint: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 6,
    marginLeft: 20,
    color: '#000000',
  },
  numberedItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 6,
    marginLeft: 20,
    color: '#000000',
  },
  table: {
    width: '100%',
    marginVertical: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
    borderRightStyle: 'solid',
  },
  tableCellLast: {
    flex: 1,
    padding: 8,
    fontSize: 10,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#F2F2F2',
    borderRightWidth: 1,
    borderRightColor: '#CCCCCC',
    borderRightStyle: 'solid',
  },
  tableHeaderCellLast: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#F2F2F2',
  },
});

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.includes('|') && trimmed.split('|').filter(s => s.trim().length > 0).length >= 1;
}

function isTableSeparator(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.includes('|')) return false;
  const content = trimmed.replace(/\|/g, '').replace(/[-:]/g, '').replace(/\s/g, '');
  return content.length === 0;
}

function parseTableRow(line: string): string[] {
  return line.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
}

function parseInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1');
}

function parseMarkdownToPDF(text: string): React.ReactElement[] {
  const elements: React.ReactElement[] = [];
  const lines = text.split('\n');
  let i = 0;
  let key = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      i++;
      continue;
    }
    
    // Skip horizontal rules
    if (trimmed === '---' || trimmed === '***') {
      i++;
      continue;
    }
    
    // Handle tables
    if (isTableRow(trimmed) && !isTableSeparator(trimmed)) {
      const headers = parseTableRow(trimmed);
      const tableRows: React.ReactElement[] = [];
      
      // Create header row
      const headerCells = headers.map((header, index) => (
        <Text 
          key={`header-${index}`} 
          style={index === headers.length - 1 ? styles.tableHeaderCellLast : styles.tableHeaderCell}
        >
          {parseInlineMarkdown(header)}
        </Text>
      ));
      
      tableRows.push(
        <View key={`row-header`} style={styles.tableRow}>
          {headerCells}
        </View>
      );
      
      // Move to next line
      i++;
      
      // Skip separator line
      if (i < lines.length && isTableSeparator(lines[i])) {
        i++;
      }
      
      // Collect data rows
      while (i < lines.length && isTableRow(lines[i]) && !isTableSeparator(lines[i])) {
        const cells = parseTableRow(lines[i]);
        const cellElements = cells.map((cell, index) => (
          <Text 
            key={`cell-${i}-${index}`} 
            style={index === cells.length - 1 ? styles.tableCellLast : styles.tableCell}
          >
            {parseInlineMarkdown(cell)}
          </Text>
        ));
        
        tableRows.push(
          <View key={`row-${i}`} style={styles.tableRow}>
            {cellElements}
          </View>
        );
        i++;
      }
      
      // Create the table
      elements.push(
        <View key={key++} style={styles.table}>
          {tableRows}
        </View>
      );
      continue;
    }
    
    // Handle headings
    if (trimmed.startsWith('### ')) {
      const headingText = trimmed.replace(/^###\s*/, '');
      elements.push(
        <Text key={key++} style={styles.heading3}>
          {headingText}
        </Text>
      );
      i++;
      continue;
    }
    
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^##\s*/, '');
      elements.push(
        <Text key={key++} style={styles.heading2}>
          {headingText}
        </Text>
      );
      i++;
      continue;
    }
    
    if (trimmed.startsWith('# ')) {
      const headingText = trimmed.replace(/^#\s*/, '');
      elements.push(
        <Text key={key++} style={styles.heading1}>
          {headingText}
        </Text>
      );
      i++;
      continue;
    }
    
    // Handle bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bulletText = trimmed.replace(/^[-*]\s*/, '');
      elements.push(
        <Text key={key++} style={styles.bulletPoint}>
          • {parseInlineMarkdown(bulletText)}
        </Text>
      );
      i++;
      continue;
    }
    
    // Handle numbered lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const listText = numberedMatch[2];
      elements.push(
        <Text key={key++} style={styles.numberedItem}>
          {numberedMatch[1]}. {parseInlineMarkdown(listText)}
        </Text>
      );
      i++;
      continue;
    }
    
    // Regular paragraph
    elements.push(
      <Text key={key++} style={styles.paragraph}>
        {parseInlineMarkdown(trimmed)}
      </Text>
    );
    i++;
  }
  
  return elements;
}

const ResearchPDFDocument: React.FC<{ data: ResearchData }> = ({ data }) => {
  const synthesisElements = parseMarkdownToPDF(data.synthesis || '');
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.query}</Text>
        <View>
          {synthesisElements}
        </View>
      </Page>
    </Document>
  );
};

export async function downloadResearchPDF(data: ResearchData) {
  const filenameSafeQuery = data.query.replace(/[^a-z0-9]+/gi, "_").replace(/_+/g, "_").toLowerCase();
  
  const blob = await pdf(<ResearchPDFDocument data={data} />).toBlob();
  saveAs(blob, `deep_research_${filenameSafeQuery}.pdf`);
}

export { ResearchPDFDocument };
