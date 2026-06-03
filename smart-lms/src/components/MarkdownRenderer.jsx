import React from 'react';

const parseInlineStyles = (text, boldColor) => {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className={boldColor}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MarkdownRenderer = ({ content, isDark = true }) => {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let currentTable = null;
  let currentList = null;

  const textColor = isDark ? "text-slate-300" : "text-slate-700";
  const boldColor = isDark ? "text-white font-bold" : "font-bold text-slate-900";
  
  const h4Color = isDark 
    ? "text-sm font-extrabold text-white mt-4 mb-2 uppercase tracking-wide" 
    : "text-sm font-extrabold text-slate-800 mt-4 mb-2 uppercase tracking-wide";
  
  const h3Color = isDark 
    ? "text-base font-extrabold text-indigo-400 mt-5 mb-2 uppercase tracking-tight" 
    : "text-base font-extrabold text-indigo-600 mt-5 mb-2 uppercase tracking-tight";
  
  const h2Color = isDark 
    ? "text-lg font-black text-indigo-500 mt-6 mb-3 tracking-tight" 
    : "text-lg font-black text-indigo-700 mt-6 mb-3 tracking-tight";

  const tableWrapperClass = isDark 
    ? "overflow-x-auto my-4 border border-slate-700/60 rounded-xl bg-slate-900/30" 
    : "overflow-x-auto my-4 border border-slate-200 rounded-xl bg-slate-50/50";
  
  const tableHeaderClass = isDark ? "bg-slate-800/60" : "bg-slate-100";
  const tableBorderClass = isDark ? "divide-y divide-slate-700" : "divide-y divide-slate-200";
  const tableRowBorderClass = isDark ? "divide-y divide-slate-800/80" : "divide-y divide-slate-150";
  
  const tableCellClass = isDark 
    ? "px-4 py-2.5 text-slate-300 font-medium" 
    : "px-4 py-2.5 text-slate-600 font-medium";
  
  const thCellClass = isDark 
    ? "px-4 py-3 text-left font-extrabold text-slate-300 uppercase tracking-wider" 
    : "px-4 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider";

  const flushTable = (key) => {
    if (currentTable) {
      elements.push(
        <div key={`table-${key}`} className={tableWrapperClass}>
          <table className="min-w-full divide-y divide-slate-700 text-xs">
            {currentTable.headers && (
              <thead className={tableHeaderClass}>
                <tr className={tableBorderClass}>
                  {currentTable.headers.map((h, i) => (
                    <th key={i} className={thCellClass}>
                      {parseInlineStyles(h, boldColor)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className={tableRowBorderClass}>
              {currentTable.rows.map((row, rIndex) => (
                <tr key={rIndex} className={isDark ? (rIndex % 2 === 0 ? "bg-slate-800/10" : "bg-slate-800/30") : (rIndex % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                  {row.map((cell, cIndex) => (
                    <td key={cIndex} className={tableCellClass}>
                      {parseInlineStyles(cell, boldColor)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  const flushList = (key) => {
    if (currentList) {
      elements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-3 space-y-1.5 text-sm">
          {currentList.map((item, index) => (
            <li key={index} className={textColor}>
              {parseInlineStyles(item, boldColor)}
            </li>
          ))}
        </ul>
      );
      currentList = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip XML tags
    if (/^<\/?(kecocokan|rekomendasi|keselarasan)>/i.test(line)) {
      continue;
    }

    // 1. Table Parsing
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList(i);
      
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const isSeparator = cells.every(cell => /^:?-+:?$/.test(cell));
      if (isSeparator) {
        continue;
      }

      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    } else {
      flushTable(i);
    }

    // 2. List Parsing
    if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
      const content = line.substring(2).trim();
      if (!currentList) {
        currentList = [content];
      } else {
        currentList.push(content);
      }
      continue;
    } else if (/^\d+\.\s/.test(line)) {
      const content = line.replace(/^\d+\.\s/, '').trim();
      if (!currentList) {
        currentList = [content];
      } else {
        currentList.push(content);
      }
      continue;
    } else {
      flushList(i);
    }

    // 3. Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={i} className={h4Color}>
          {parseInlineStyles(line.substring(4), boldColor)}
        </h4>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h3 key={i} className={h3Color}>
          {parseInlineStyles(line.substring(3), boldColor)}
        </h3>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h2 key={i} className={h2Color}>
          {parseInlineStyles(line.substring(2), boldColor)}
        </h2>
      );
      continue;
    }

    // 4. Paragraph or empty line
    if (line === '') {
      continue;
    }

    elements.push(
      <p key={i} className={`text-sm leading-relaxed mb-3 ${textColor}`}>
        {parseInlineStyles(line, boldColor)}
      </p>
    );
  }

  flushTable(lines.length);
  flushList(lines.length);

  return <div className="markdown-body">{elements}</div>;
};

export default MarkdownRenderer;
