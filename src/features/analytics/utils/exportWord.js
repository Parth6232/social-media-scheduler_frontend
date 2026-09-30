import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
} from 'docx';

/**
 * Generates and downloads a branded Word (.docx) Analytics Report.
 * @param {Object} options
 * @param {Object} options.data - The analytics data object
 * @param {string} options.range - Selected range ('7d', '30d', '90d', 'all')
 * @param {string} options.platform - Selected platform ('all', 'instagram', 'youtube', 'facebook')
 */
export const downloadAnalyticsWord = async ({ data = {}, range = '30d', platform = 'all' } = {}) => {
  const totals = data?.totals || {};
  const platforms = data?.platforms || [];
  const postTypes = data?.postTypes || [];
  const topPosts = data?.topPosts || [];
  const bestSlots = data?.bestTime?.slots || [];
  const failures = data?.failures || {};

  const rangeLabels = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' };
  const platformLabel = platform === 'all' ? 'All Platforms (Instagram, YouTube, Facebook)' : platform.toUpperCase();
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  };

  const headerShading = { fill: '7C3AED', type: ShadingType.CLEAR };
  const subHeaderShading = { fill: 'F1F5F9', type: ShadingType.CLEAR };

  const createCell = (text, isHeader = false, isSubHeader = false, widthPercent = null) => {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text: String(text ?? '-'),
              bold: isHeader || isSubHeader,
              color: isHeader ? 'FFFFFF' : '1E1B4B',
              size: 20, // 10pt
            }),
          ],
        }),
      ],
      borders: cellBorder,
      shading: isHeader ? headerShading : isSubHeader ? subHeaderShading : undefined,
      width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    });
  };

  // 1. KPI Summary Table
  const kpiTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createCell('Executive Summary Metrics', true, false, 50),
          createCell('Value', true, false, 50),
        ],
      }),
      new TableRow({
        children: [createCell('Total Posts', false, true), createCell(totals.posts || totals.targets || 0)],
      }),
      new TableRow({
        children: [createCell('Published Posts', false, true), createCell(totals.published || 0)],
      }),
      new TableRow({
        children: [createCell('Failed Posts', false, true), createCell(totals.failed || 0)],
      }),
      new TableRow({
        children: [createCell('Success Rate', false, true), createCell(`${totals.successRate || 0}%`)],
      }),
      new TableRow({
        children: [createCell('Total Views / Reach', false, true), createCell((totals.views || 0).toLocaleString())],
      }),
      new TableRow({
        children: [createCell('Total Likes / Engagements', false, true), createCell((totals.likes || 0).toLocaleString())],
      }),
      new TableRow({
        children: [createCell('Avg Views per Post', false, true), createCell(totals.avgViews || 0)],
      }),
      new TableRow({
        children: [createCell('Avg Likes per Post', false, true), createCell(totals.avgLikes || 0)],
      }),
    ],
  });

  // 2. Platforms Table
  const platformTableRows = [
    new TableRow({
      children: [
        createCell('Platform', true),
        createCell('Targets', true),
        createCell('Published', true),
        createCell('Failed', true),
        createCell('Success Rate', true),
        createCell('Views', true),
        createCell('Likes', true),
        createCell('Avg Views', true),
      ],
    }),
  ];

  platforms.forEach((p) => {
    platformTableRows.push(
      new TableRow({
        children: [
          createCell(p.platform?.toUpperCase()),
          createCell(p.posts || p.targets || 0),
          createCell(p.published || 0),
          createCell(p.failed || 0),
          createCell(`${p.successRate || 0}%`),
          createCell((p.views || 0).toLocaleString()),
          createCell((p.likes || 0).toLocaleString()),
          createCell(p.avgViews || 0),
        ],
      })
    );
  });
  const platformTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: platformTableRows,
  });

  // 3. Post Types Table
  const postTypeTableRows = [
    new TableRow({
      children: [
        createCell('Format', true),
        createCell('Total Posts', true),
        createCell('Published', true),
        createCell('Failed', true),
        createCell('Success Rate', true),
        createCell('Views', true),
        createCell('Likes', true),
      ],
    }),
  ];

  postTypes.forEach((pt) => {
    postTypeTableRows.push(
      new TableRow({
        children: [
          createCell((pt.postType || '-').toUpperCase()),
          createCell(pt.posts || pt.targets || 0),
          createCell(pt.published || 0),
          createCell(pt.failed || 0),
          createCell(`${pt.successRate || 0}%`),
          createCell((pt.views || 0).toLocaleString()),
          createCell((pt.likes || 0).toLocaleString()),
        ],
      })
    );
  });
  const postTypesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: postTypeTableRows,
  });

  // 4. Top Posts Table
  const topPostsTableRows = [
    new TableRow({
      children: [
        createCell('#', true, false, 5),
        createCell('Platform', true, false, 15),
        createCell('Type', true, false, 15),
        createCell('Caption / Content', true, false, 45),
        createCell('Views', true, false, 10),
        createCell('Likes', true, false, 10),
      ],
    }),
  ];

  topPosts.slice(0, 5).forEach((tp, idx) => {
    topPostsTableRows.push(
      new TableRow({
        children: [
          createCell(idx + 1),
          createCell(tp.platform?.toUpperCase()),
          createCell((tp.postType || 'feed').toUpperCase()),
          createCell(tp.content || '-'),
          createCell((tp.views || 0).toLocaleString()),
          createCell((tp.likes || 0).toLocaleString()),
        ],
      })
    );
  });
  const topPostsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: topPostsTableRows,
  });

  // Assemble the Word Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Document Title
          new Paragraph({
            text: 'PostPilot Analytics Report',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          // Metadata info
          new Paragraph({
            children: [
              new TextRun({ text: `Date Range: `, bold: true }),
              new TextRun({ text: `${rangeLabels[range] || range}   |   ` }),
              new TextRun({ text: `Platform: `, bold: true }),
              new TextRun({ text: `${platformLabel}   |   ` }),
              new TextRun({ text: `Generated: `, bold: true }),
              new TextRun({ text: `${dateStr} IST` }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Section 1: KPI Summary
          new Paragraph({
            text: '1. Executive Summary & Key Performance Indicators',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 120 },
          }),
          kpiTable,

          // Section 2: Platform Breakdown
          new Paragraph({
            text: '2. Multi-Platform Performance Breakdown',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          }),
          platformTable,

          // Section 3: Content Format
          new Paragraph({
            text: '3. Content Format & Post Type Breakdown',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          }),
          postTypesTable,

          // Section 4: Top Performing Posts
          new Paragraph({
            text: '4. Top Performing Content',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          }),
          topPostsTable,

          // Section 5: Strategic Recommendations
          new Paragraph({
            text: '5. Strategic Recommendations & Optimization',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Best Time to Post: `,
                bold: true,
              }),
              new TextRun({
                text: bestSlots.length > 0 ? bestSlots.map((s) => s.label).join(', ') : 'Maintain consistent posting schedule.',
              }),
            ],
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `• Failure Diagnostics: `,
                bold: true,
              }),
              new TextRun({
                text: failures.total > 0
                  ? (failures.reasons || []).map((r) => `${r.reason} (${r.count})`).join('; ')
                  : 'Zero critical publishing errors recorded.',
              }),
            ],
            spacing: { after: 240 },
          }),

          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: 'Generated by PostPilot Social Media Scheduler — All rights reserved.',
                color: '64748B',
                size: 18,
                italics: true,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = `postpilot-analytics-${range}-${new Date().toISOString().slice(0, 10)}.docx`;
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);

  return filename;
};
