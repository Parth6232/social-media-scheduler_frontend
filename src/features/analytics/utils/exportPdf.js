import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a branded PDF Analytics Report.
 * @param {Object} options
 * @param {Object} options.data - The analytics data object (totals, platforms, postTypes, topPosts, failures, meta, etc.)
 * @param {string} options.range - Selected range ('7d', '30d', '90d', 'all')
 * @param {string} options.platform - Selected platform ('all', 'instagram', 'youtube', 'facebook')
 */
export const downloadAnalyticsPdf = async ({ data = {}, range = '30d', platform = 'all' } = {}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const primaryColor = [124, 58, 237]; // #2563EB (Purple)
  const secondaryColor = [217, 70, 239]; // #1D4ED8 (Pink/Magenta)
  const darkTextColor = [30, 27, 75]; // #1E1B4B
  const grayTextColor = [100, 116, 139]; // #64748B
  const lightBgColor = [248, 250, 252]; // #F8FAFC

  const pageWidth = doc.internal.pageSize.getWidth();
  let currentY = 40;

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.roundedRect(40, currentY, pageWidth - 80, 60, 8, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PostPilot Analytics Report', 55, currentY + 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Generated: ${dateStr} IST`, pageWidth - 55, currentY + 36, { align: 'right' });

  currentY += 80;

  // 2. Report Metadata Summary
  doc.setTextColor(...darkTextColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  const rangeLabels = { '7d': 'Last 7 Days', '30d': 'Last 30 Days', '90d': 'Last 90 Days', 'all': 'All Time' };
  const platformLabel = platform === 'all' ? 'All Platforms (Instagram, YouTube, Facebook)' : platform.toUpperCase();
  doc.text(`Filter Range: ${rangeLabels[range] || range}   |   Platform: ${platformLabel}`, 40, currentY);

  currentY += 18;

  // 3. Key Metrics Table / Executive Summary
  const totals = data?.totals || {};
  const kpiData = [
    [
      { content: 'Total Posts', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${totals.posts || totals.targets || 0}`,
      { content: 'Published Posts', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${totals.published || 0}`,
    ],
    [
      { content: 'Success Rate', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${totals.successRate || 0}%`,
      { content: 'Failed Posts', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${totals.failed || 0}`,
    ],
    [
      { content: 'Total Views / Reach', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${(totals.views || 0).toLocaleString()}`,
      { content: 'Total Engagements (Likes)', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${(totals.likes || 0).toLocaleString()}`,
    ],
    [
      { content: 'Avg Views per Post', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${totals.avgViews || 0}`,
      { content: 'Avg Likes per Post', styles: { fontStyle: 'bold', fillColor: lightBgColor } },
      `${totals.avgLikes || 0}`,
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [[{ content: 'Executive Summary — Key Performance Indicators', colSpan: 4, styles: { fillColor: primaryColor, textColor: 255, halign: 'left', fontStyle: 'bold' } }]],
    body: kpiData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 6, textColor: darkTextColor },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { cellWidth: 115 },
      2: { cellWidth: 140 },
      3: { cellWidth: 120 },
    },
    margin: { left: 40, right: 40 },
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // 4. Platform Performance Breakdown
  const platforms = data?.platforms || [];
  if (platforms.length > 0) {
    const platformRows = platforms.map((p) => [
      p.platform?.toUpperCase() || '-',
      `${p.posts || p.targets || 0}`,
      `${p.published || 0}`,
      `${p.failed || 0}`,
      `${p.successRate || 0}%`,
      (p.views || 0).toLocaleString(),
      (p.likes || 0).toLocaleString(),
      `${p.avgViews || 0}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'Platform',
          'Targets',
          'Published',
          'Failed',
          'Success %',
          'Views',
          'Likes',
          'Avg Views/Post',
        ],
      ],
      body: platformRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 5, textColor: darkTextColor },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;
  }

  // 5. Post Format Breakdown
  const postTypes = data?.postTypes || [];
  if (postTypes.length > 0) {
    // Check if we need page break
    if (currentY > 620) {
      doc.addPage();
      currentY = 40;
    }

    const postTypeRows = postTypes.map((pt) => [
      (pt.postType || '-').toUpperCase(),
      `${pt.posts || pt.targets || 0}`,
      `${pt.published || 0}`,
      `${pt.failed || 0}`,
      `${pt.successRate || 0}%`,
      (pt.views || 0).toLocaleString(),
      (pt.likes || 0).toLocaleString(),
      `${pt.avgViews || 0}`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [
        [
          'Content Format',
          'Total Posts',
          'Published',
          'Failed',
          'Success %',
          'Views',
          'Likes',
          'Avg Views',
        ],
      ],
      body: postTypeRows,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 5, textColor: darkTextColor },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;
  }

  // 6. Top Performing Posts
  const topPosts = data?.topPosts || [];
  if (topPosts.length > 0) {
    if (currentY > 580) {
      doc.addPage();
      currentY = 40;
    }

    const topPostRows = topPosts.slice(0, 5).map((tp, idx) => [
      `#${idx + 1}`,
      tp.platform?.toUpperCase() || '-',
      (tp.postType || 'feed').toUpperCase(),
      (tp.content || '').slice(0, 65) + (tp.content?.length > 65 ? '...' : ''),
      (tp.views || 0).toLocaleString(),
      (tp.likes || 0).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Rank', 'Platform', 'Type', 'Post Caption / Topic Preview', 'Views', 'Likes']],
      body: topPostRows,
      theme: 'grid',
      headStyles: { fillColor: [219, 39, 119], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 5, textColor: darkTextColor },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 65 },
        2: { cellWidth: 50 },
        3: { cellWidth: 235 },
        4: { cellWidth: 65 },
        5: { cellWidth: 65 },
      },
      margin: { left: 40, right: 40 },
    });

    currentY = doc.lastAutoTable.finalY + 25;
  }

  // 7. Best Time & Health Summary
  const bestSlots = data?.bestTime?.slots || [];
  const failures = data?.failures || {};
  if (bestSlots.length > 0 || failures.total > 0) {
    if (currentY > 640) {
      doc.addPage();
      currentY = 40;
    }

    const recommendations = [];
    if (bestSlots.length > 0) {
      const slotsStr = bestSlots.map((s) => s.label).join(', ');
      recommendations.push(['Optimal Publishing Times', slotsStr]);
    }
    if (failures.total > 0) {
      const reasonsStr = (failures.reasons || []).map((r) => `${r.reason} (${r.count})`).join('; ') || `${failures.total} failures recorded`;
      recommendations.push(['Failure Diagnostics', reasonsStr]);
    }

    if (recommendations.length > 0) {
      autoTable(doc, {
        startY: currentY,
        head: [[{ content: 'Strategic Recommendations & Diagnostic Insights', colSpan: 2, styles: { fillColor: [71, 85, 105], textColor: 255, fontStyle: 'bold' } }]],
        body: recommendations,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 6, textColor: darkTextColor },
        columnStyles: {
          0: { cellWidth: 150, fontStyle: 'bold', fillColor: lightBgColor },
          1: { cellWidth: 365 },
        },
        margin: { left: 40, right: 40 },
      });
    }
  }

  // Add Page Numbers & Footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...grayTextColor);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'PostPilot Social Media Scheduler — Automated Analytics Report',
      40,
      doc.internal.pageSize.getHeight() - 20
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 40,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'right' }
    );
  }

  const filename = `postpilot-analytics-${range}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
  return filename;
};
