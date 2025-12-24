import jsPDF from "jspdf";
import type { Cost, Budget, Expense, Project, FinancialAnalytics, Contract, DashboardData } from "@/interfaces";
import { formatCurrency, formatDate } from "./format";
import { CURRENCIES, COST_CATEGORIES, APP_NAME } from "@/core/config/constants";

// Color utility: Convert hex to RGB array for jsPDF
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
}

// Helper to add logo/branding to PDF with clean styling
async function addLogoToPDF(doc: jsPDF, x: number, y: number, size: number = 22): Promise<void> {
  try {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = "/Artboard1.svg";
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = size * 2;
          canvas.height = size * 2;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, size * 2, size * 2);
            const imgData = canvas.toDataURL("image/png");
            doc.addImage(imgData, "PNG", x, y, size, size);
          }
        } catch (error) {
          // Fallback: Use clean text-based branding
          const [r, g, b] = hexToRgb("#2563EB");
          doc.setFillColor(r, g, b);
          doc.rect(x, y, size, size, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(size * 0.4);
          doc.setFont("helvetica", "bold");
          const textX = x + (size - doc.getTextWidth("NB")) / 2;
          const textY = y + size * 0.65;
          doc.text("NB", textX, textY);
          doc.setTextColor(0, 0, 0);
        }
        resolve();
      };
      
      img.onerror = () => {
        // Fallback: Use clean text-based branding
        const [r, g, b] = hexToRgb("#2563EB");
        doc.setFillColor(r, g, b);
        doc.rect(x, y, size, size, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(size * 0.4);
        doc.setFont("helvetica", "bold");
        const textX = x + (size - doc.getTextWidth("NB")) / 2;
        const textY = y + size * 0.65;
        doc.text("NB", textX, textY);
        doc.setTextColor(0, 0, 0);
        resolve();
      };
      
      // Timeout after 1 second
      setTimeout(() => {
        const [r, g, b] = hexToRgb("#2563EB");
        doc.setFillColor(r, g, b);
        doc.rect(x, y, size, size, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(size * 0.4);
        doc.setFont("helvetica", "bold");
        const textX = x + (size - doc.getTextWidth("NB")) / 2;
        const textY = y + size * 0.65;
        doc.text("NB", textX, textY);
        doc.setTextColor(0, 0, 0);
        resolve();
      }, 1000);
    });
  } catch (error) {
    // Fallback: Use clean text-based branding
    const [r, g, b] = hexToRgb("#2563EB");
    doc.setFillColor(r, g, b);
    doc.rect(x, y, size, size, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(size * 0.4);
    doc.setFont("helvetica", "bold");
    const textX = x + (size - doc.getTextWidth("NB")) / 2;
    const textY = y + size * 0.65;
    doc.text("NB", textX, textY);
    doc.setTextColor(0, 0, 0);
  }
}

// Helper to draw a horizontal line with proper color
function drawLine(doc: jsPDF, x: number, y: number, width: number, color: string = "#E5E7EB") {
  const [r, g, b] = hexToRgb(color);
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.line(x, y, x + width, y);
}

// Helper to draw a filled rectangle (for headers) with proper color
function drawHeaderBox(doc: jsPDF, x: number, y: number, width: number, height: number, color: string = "#F9FAFB") {
  const [r, g, b] = hexToRgb(color);
  doc.setFillColor(r, g, b);
  doc.rect(x, y, width, height, "F");
}

// Helper to draw table borders
function drawTableBorders(doc: jsPDF, x: number, y: number, width: number, height: number) {
  const [r, g, b] = hexToRgb("#E5E7EB");
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  // Top, right, bottom, left
  doc.line(x, y, x + width, y); // Top
  doc.line(x + width, y, x + width, y + height); // Right
  doc.line(x + width, y + height, x, y + height); // Bottom
  doc.line(x, y + height, x, y); // Left
}

// Helper to draw cell border (vertical line)
function drawCellBorder(doc: jsPDF, x: number, y: number, height: number) {
  const [r, g, b] = hexToRgb("#E5E7EB");
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.3);
  doc.line(x, y, x, y + height);
}

// Helper to create a professional, clean, and friendly header
async function createPDFHeader(doc: jsPDF, title: string, pageWidth: number, margin: number, headerHeight: number = 40) {
  // Simple, clean white background for the header area
  drawHeaderBox(doc, 0, 0, pageWidth, headerHeight, "#FFFFFF");
  
  // A clean, solid bottom border with a professional blue color
  const [r, g, b] = hexToRgb("#2563EB");
  doc.setDrawColor(r, g, b);
  doc.setLineWidth(1.5);
  doc.line(margin, headerHeight - 5, pageWidth - margin, headerHeight - 5);
  
  // Small, clear logo
  const logoSize = 18;
  const logoY = (headerHeight - logoSize) / 2 - 2;
  await addLogoToPDF(doc, margin, logoY, logoSize);
  
  // App Name - clean and professional
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  const [nr, ng, nb] = hexToRgb("#1E40AF");
  doc.setTextColor(nr, ng, nb);
  const appNameY = logoY + logoSize - 1;
  doc.text(APP_NAME, margin + logoSize + 8, appNameY);
  
  // Title/Report Type - positioned to the right
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const [tr, tg, tb] = hexToRgb("#64748B");
  doc.setTextColor(tr, tg, tb);
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, pageWidth - margin - titleWidth, appNameY);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
}

// Helper to create consistent footer
function createPDFFooter(doc: jsPDF, pageNum: number, totalPages: number, pageWidth: number, pageHeight: number, margin: number) {
  const [r, g, b] = hexToRgb("#6B7280");
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(r, g, b);
  const footerY = pageHeight - 10;
  doc.text(`${APP_NAME} - Confidential`, margin, footerY);
  const pageText = `Page ${pageNum} of ${totalPages}`;
  doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), footerY);
}

// Helper to add generation date
function addGenerationDate(doc: jsPDF, margin: number, yPosition: number): number {
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  const [r, g, b] = hexToRgb("#6B7280");
  doc.setTextColor(r, g, b);
  const generatedDate = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
  doc.text(`Generated on ${generatedDate}`, margin, yPosition);
  return yPosition + 12;
}

// Helper to format amount with currency
function formatAmount(amount: number | string, currency: string = "USD"): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  const safeAmount = isNaN(numAmount) ? 0 : numAmount;
  const currencyInfo = CURRENCIES.find((c) => c.value === currency);
  return `${currencyInfo?.symbol || "$"}${safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Helper to safely get category label
function getCategoryLabel(category: string): string {
  return COST_CATEGORIES.find((c) => c.value === category)?.label || category;
}

export async function downloadCostsPDF(costs: Cost[], title: string = "Costs Report") {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    // Header
    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    // Generation Date
    yPosition = addGenerationDate(doc, margin, yPosition);

    // Summary Box
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 40;
    drawHeaderBox(doc, margin, summaryBoxY, pageWidth - (margin * 2), summaryBoxHeight, "#F9FAFB");
    drawLine(doc, margin, summaryBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, summaryBoxY + summaryBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", margin + 5, yPosition);
    yPosition += 10;

    const total = costs.reduce((sum, cost) => {
      const amount = typeof cost.amount === "string" ? parseFloat(cost.amount) : cost.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const currency = costs[0]?.currency || "USD";
    const currencySymbol = CURRENCIES.find((c) => c.value === currency)?.symbol || "$";

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const totalFormatted = formatAmount(total, currency);
    doc.text(`Total Costs:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(totalFormatted, margin + 45, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Transactions:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${costs.length}`, margin + 60, yPosition);
    
    yPosition = summaryBoxY + summaryBoxHeight + 10;

    // Table Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Cost Details", margin, yPosition);
    yPosition += 12;

    // Table Header
    const tableHeaderY = yPosition;
    const rowHeight = 8;
    const [hr, hg, hb] = hexToRgb("#1E40AF");
    drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
    drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
    
    const colWidths = [55, 38, 26, 26, 20];
    const headers = ["Name", "Amount", "Category", "Date", "Currency"];
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    let xPos = margin + 3;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableHeaderY);
      if (i < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
      }
      xPos += colWidths[i];
    });
    
    yPosition = tableHeaderY + rowHeight;
    doc.setTextColor(0, 0, 0);

    // Table Data Rows
    doc.setFont("helvetica", "normal");
    costs.forEach((cost, index) => {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin + 10;
      }

      const rawAmount = typeof cost.amount === "string" ? parseFloat(cost.amount) : cost.amount;
      const safeAmount = isNaN(rawAmount) ? 0 : rawAmount;
      const category = getCategoryLabel(cost.category);
      const amountFormatted = formatAmount(safeAmount, cost.currency);

      // Alternate row background
      if (index % 2 === 0) {
        drawHeaderBox(doc, margin, yPosition - 5, pageWidth - margin * 2, rowHeight, "#F9FAFB");
      }
      drawTableBorders(doc, margin, yPosition - 5, pageWidth - margin * 2, rowHeight);

      // Main row
      xPos = margin + 3;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const nameText = cost.name.length > 35 ? cost.name.substring(0, 32) + "..." : cost.name;
      doc.text(nameText, xPos, yPosition);
      let colIndex = 0;
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];

      doc.setFont("helvetica", "bold");
      const amountText = amountFormatted.length > 12 ? amountFormatted.substring(0, 10) + "..." : amountFormatted;
      doc.text(amountText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];

      doc.setFont("helvetica", "normal");
      const categoryText = category.length > 12 ? category.substring(0, 10) + "..." : category;
      doc.text(categoryText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];

      const dateText = formatDate(cost.date);
      doc.text(dateText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];

      doc.setFontSize(8);
      const currencyText = (cost.currency || "USD").toUpperCase();
      doc.text(currencyText, xPos, yPosition);
      yPosition += rowHeight + 2;

      // Optional secondary line: project + tags
      const hasProject = !!cost.projectId;
      const hasTags = Array.isArray(cost.tags) && cost.tags.length > 0;
      const hasDescription = !!cost.description;

      if (hasProject || hasTags || hasDescription) {
        doc.setFontSize(7);
        const [mr, mg, mb] = hexToRgb("#64748B");
        doc.setTextColor(mr, mg, mb);
        let detailText = "";

        if (hasProject) {
          detailText += `Project: ${String(cost.projectId).substring(0, 20)}`;
        }
        if (hasTags) {
          const tagsPreview = cost.tags!.slice(0, 3).join(", ");
          detailText += (detailText ? "   •   " : "") + `Tags: ${tagsPreview}`;
        }
        if (hasDescription) {
          const desc = String(cost.description).substring(0, 60);
          detailText += (detailText ? "   •   " : "") + `Note: ${desc}`;
        }

        doc.text(detailText, margin + 3, yPosition);
        doc.setTextColor(0, 0, 0);
        yPosition += 5;
      }
    });

    // Footer on each page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    // Save
    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating costs PDF:", error);
    throw error;
  }
}

export async function downloadBudgetsPDF(budgets: Budget[], title: string = "Budgets Report") {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    // Summary Box
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 40;
    drawHeaderBox(doc, margin, summaryBoxY, pageWidth - (margin * 2), summaryBoxHeight, "#F9FAFB");
    drawLine(doc, margin, summaryBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, summaryBoxY + summaryBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", margin + 5, yPosition);
    yPosition += 10;

    const total = budgets.reduce((sum, budget) => {
      const amount = typeof budget.amount === "string" ? parseFloat(budget.amount) : budget.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const currency = budgets[0]?.currency || "USD";
    const totalFormatted = formatAmount(total, currency);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Budget:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(totalFormatted, margin + 45, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Total Budgets:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${budgets.length}`, margin + 50, yPosition);
    
    yPosition = summaryBoxY + summaryBoxHeight + 10;

    // Table Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Budget Details", margin, yPosition);
    yPosition += 12;

    // Table Header
    const tableHeaderY = yPosition;
    const rowHeight = 8;
    drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
    drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
    
    const colWidths = [42, 35, 20, 20, 26, 20];
    const headers = ["Name", "Amount", "Category", "Period", "Start Date", "Currency"];
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    let xPos = margin + 3;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableHeaderY);
      if (i < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
      }
      xPos += colWidths[i];
    });
    
    yPosition = tableHeaderY + rowHeight;
    doc.setTextColor(0, 0, 0);

    // Table Data Rows
    doc.setFont("helvetica", "normal");
    budgets.forEach((budget, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin + 10;
      }

      const category = getCategoryLabel(budget.category);
      const amount = typeof budget.amount === "string" ? parseFloat(budget.amount) : budget.amount;
      const amountFormatted = formatAmount(amount, budget.currency);

      if (index % 2 === 0) {
        drawHeaderBox(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight, "#F9FAFB");
      }
      drawTableBorders(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight);

      xPos = margin + 3;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const nameText = budget.name.length > 18 ? budget.name.substring(0, 16) + "..." : budget.name;
      doc.text(nameText, xPos, yPosition);
      let colIndex = 0;
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "bold");
      const amountText = amountFormatted.length > 12 ? amountFormatted.substring(0, 10) + "..." : amountFormatted;
      doc.text(amountText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "normal");
      const categoryText = category.length > 10 ? category.substring(0, 8) + "..." : category;
      doc.text(categoryText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.text(budget.period, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.text(formatDate(budget.startDate), xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFontSize(8);
      const currencyText = (budget.currency || "USD").toUpperCase();
      doc.text(currencyText, xPos, yPosition);
      yPosition += rowHeight + 2;
    });

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating budgets PDF:", error);
    throw error;
  }
}

export async function downloadExpensesPDF(expenses: Expense[], title: string = "Expenses Report") {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    // Summary Box
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 40;
    drawHeaderBox(doc, margin, summaryBoxY, pageWidth - (margin * 2), summaryBoxHeight, "#F9FAFB");
    drawLine(doc, margin, summaryBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, summaryBoxY + summaryBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", margin + 5, yPosition);
    yPosition += 10;

    const total = expenses.reduce((sum, expense) => {
      const amount = typeof expense.amount === "string" ? parseFloat(expense.amount) : expense.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const activeExpenses = expenses.filter((e) => e.isActive).length;
    const currency = expenses[0]?.currency || "USD";
    const totalFormatted = formatAmount(total, currency);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Expenses:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(totalFormatted, margin + 50, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Active Expenses:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeExpenses} / ${expenses.length}`, margin + 55, yPosition);
    
    yPosition = summaryBoxY + summaryBoxHeight + 10;

    // Table Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Expense Details", margin, yPosition);
    yPosition += 12;

    const tableHeaderY = yPosition;
    const rowHeight = 8;
    drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
    drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
    
    const colWidths = [45, 35, 25, 20, 25, 20];
    const headers = ["Name", "Amount", "Category", "Frequency", "Start Date", "Status"];
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    let xPos = margin + 3;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableHeaderY);
      if (i < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
      }
      xPos += colWidths[i];
    });
    
    yPosition = tableHeaderY + rowHeight;
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "normal");
    expenses.forEach((expense, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin + 10;
      }

      if (index % 2 === 0) {
        drawHeaderBox(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight, "#F9FAFB");
      }
      drawTableBorders(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight);

      const category = getCategoryLabel(expense.category);
      const amount = typeof expense.amount === "string" ? parseFloat(expense.amount) : expense.amount;
      const amountFormatted = formatAmount(amount, expense.currency);

      xPos = margin + 3;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const nameText = expense.name.length > 22 ? expense.name.substring(0, 20) + "..." : expense.name;
      doc.text(nameText, xPos, yPosition);
      let colIndex = 0;
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "bold");
      const amountText = amountFormatted.length > 12 ? amountFormatted.substring(0, 10) + "..." : amountFormatted;
      doc.text(amountText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "normal");
      const categoryText = category.length > 12 ? category.substring(0, 10) + "..." : category;
      doc.text(categoryText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.text(expense.frequency, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.text(formatDate(expense.startDate), xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "bold");
      doc.setTextColor(expense.isActive ? 22 : 220, expense.isActive ? 163 : 38, expense.isActive ? 74 : 38);
      doc.text(expense.isActive ? "Active" : "Inactive", xPos, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += rowHeight + 2;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating expenses PDF:", error);
    throw error;
  }
}

export async function downloadProjectReportPDF(
  project: Project,
  costs: Cost[],
  expenses: Expense[],
  budgets: Budget[],
  tasks: any[],
  sprints: any[],
  title?: string
) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 50;
    let yPosition = margin;

    const reportTitle = title || `${project.name} - Project Report`;

    await createPDFHeader(doc, reportTitle, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    // Project Information Box
    const projectBoxY = yPosition;
    const projectBoxHeight = 50;
    drawHeaderBox(doc, margin, projectBoxY, pageWidth - (margin * 2), projectBoxHeight, "#F9FAFB");
    drawLine(doc, margin, projectBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, projectBoxY + projectBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Project Information", margin + 5, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Name:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(project.name, margin + 25, yPosition);
    yPosition += 7;

    if (project.description) {
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(`Description: ${project.description}`, pageWidth - margin * 2 - 10);
      doc.text(descLines, margin + 5, yPosition);
      yPosition += descLines.length * 5;
    }

    doc.setFont("helvetica", "normal");
    doc.text(`Status:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(project.status || "N/A", margin + 25, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Progress:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${project.progress}%`, margin + 30, yPosition);
    
    yPosition = projectBoxY + projectBoxHeight + 10;

    const projectCosts = costs.filter((c) => c.projectId === project.uid);
    const projectExpenses = expenses.filter((e) => e.projectId === project.uid);
    const projectBudgets = budgets.filter((b) => b.projectId === project.uid);

    const totalCosts = projectCosts.reduce(
      (sum, c) => sum + (typeof c.amount === "number" ? c.amount : parseFloat(c.amount) || 0),
      0
    );
    const totalExpenses = projectExpenses.reduce(
      (sum, e) => sum + (typeof e.amount === "number" ? e.amount : parseFloat(e.amount) || 0),
      0
    );
    const totalBudgets = projectBudgets.reduce(
      (sum, b) => sum + (typeof b.amount === "number" ? b.amount : parseFloat(b.amount) || 0),
      0
    );

    const currency = projectCosts[0]?.currency || projectExpenses[0]?.currency || projectBudgets[0]?.currency || "USD";

    // Financial Summary Box
    const financialBoxY = yPosition;
    const financialBoxHeight = 55;
    drawHeaderBox(doc, margin, financialBoxY, pageWidth - (margin * 2), financialBoxHeight, "#F9FAFB");
    drawLine(doc, margin, financialBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, financialBoxY + financialBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Summary", margin + 5, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Budget:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(formatAmount(totalBudgets, currency), margin + 45, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Costs:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(formatAmount(totalCosts, currency), margin + 45, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Expenses:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(formatAmount(totalExpenses, currency), margin + 50, yPosition);
    yPosition += 7;

    const totalSpending = totalCosts + totalExpenses;
    const remaining = totalBudgets - totalSpending;
    doc.setFont("helvetica", "normal");
    doc.text(`Remaining:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(remaining >= 0 ? 22 : 220, remaining >= 0 ? 163 : 38, remaining >= 0 ? 74 : 38);
    doc.text(formatAmount(remaining, currency), margin + 40, yPosition);
    doc.setTextColor(0, 0, 0);
    
    yPosition = financialBoxY + financialBoxHeight + 10;

    // Project Statistics
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Project Statistics", margin, yPosition);
    yPosition += 12;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Tasks:`, margin + 3, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${tasks.length}`, margin + 40, yPosition);
    yPosition += 7;

    const completedTasks = tasks.filter((t) => t.status === "complete").length;
    doc.setFont("helvetica", "normal");
    doc.text(`Completed Tasks:`, margin + 3, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${completedTasks}`, margin + 50, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Sprints:`, margin + 3, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${sprints.length}`, margin + 45, yPosition);
    yPosition += 7;

    const activeSprints = sprints.filter((s) => s.status === "active").length;
    doc.setFont("helvetica", "normal");
    doc.text(`Active Sprints:`, margin + 3, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeSprints}`, margin + 45, yPosition);

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating project report PDF:", error);
    throw error;
  }
}

export async function downloadFinancialReportPDF(
  costs: Cost[],
  expenses: Expense[],
  budgets: Budget[],
  analytics: FinancialAnalytics,
  title: string = "Financial Report"
) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    // Financial Overview
    const overviewBoxY = yPosition;
    const overviewBoxHeight = 60;
    drawHeaderBox(doc, margin, overviewBoxY, pageWidth - (margin * 2), overviewBoxHeight, "#F9FAFB");
    drawLine(doc, margin, overviewBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, overviewBoxY + overviewBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Financial Overview", margin + 5, yPosition);
    yPosition += 10;

    const currency = costs[0]?.currency || expenses[0]?.currency || budgets[0]?.currency || "USD";

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Costs:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(formatAmount(analytics.totalCosts, currency), margin + 45, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Expenses:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(formatAmount(analytics.totalExpenses, currency), margin + 50, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Budgets:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(formatAmount(analytics.totalBudgets, currency), margin + 50, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Budget Utilization:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const utilizationColor = analytics.budgetUtilization > 100 ? [220, 38, 38] : analytics.budgetUtilization > 80 ? [234, 179, 8] : [22, 163, 74];
    doc.setTextColor(utilizationColor[0], utilizationColor[1], utilizationColor[2]);
    doc.text(`${analytics.budgetUtilization.toFixed(1)}%`, margin + 60, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;

    const totalSpending = analytics.totalCosts + analytics.totalExpenses;
    const remaining = analytics.totalBudgets - totalSpending;
    doc.setFont("helvetica", "normal");
    doc.text(`Remaining Budget:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(remaining >= 0 ? 22 : 220, remaining >= 0 ? 163 : 38, remaining >= 0 ? 74 : 38);
    doc.text(formatAmount(remaining, currency), margin + 55, yPosition);
    doc.setTextColor(0, 0, 0);

    yPosition = overviewBoxY + overviewBoxHeight + 15;

    // Category Breakdown
    if (analytics.categoryBreakdown && analytics.categoryBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Category Breakdown", margin, yPosition);
      yPosition += 12;

      const tableHeaderY = yPosition;
      const rowHeight = 8;
      drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
      drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
      
      const colWidths = [50, 40, 40, 35];
      const headers = ["Category", "Costs", "Expenses", "Percentage"];
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      let xPos = margin + 3;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableHeaderY);
        if (i < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
        }
        xPos += colWidths[i];
      });
      
      yPosition = tableHeaderY + rowHeight;
      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "normal");
      analytics.categoryBreakdown.forEach((item, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin + 10;
        }

        if (index % 2 === 0) {
          drawHeaderBox(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight, "#F9FAFB");
        }
        drawTableBorders(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight);

        xPos = margin + 3;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const categoryText = getCategoryLabel(item.category);
        doc.text(categoryText, xPos, yPosition);
        let colIndex = 0;
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.setFont("helvetica", "normal");
        doc.text(formatAmount(item.costs, currency), xPos, yPosition);
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.text(formatAmount(item.expenses, currency), xPos, yPosition);
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.text(`${item.percentage.toFixed(1)}%`, xPos, yPosition);
        yPosition += rowHeight + 2;
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating financial report PDF:", error);
    throw error;
  }
}

export async function downloadAnalyticsReportPDF(
  costs: Cost[],
  expenses: Expense[],
  budgets: Budget[],
  analytics: FinancialAnalytics,
  title: string = "Analytics Report"
) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    const currency = costs[0]?.currency || expenses[0]?.currency || budgets[0]?.currency || "USD";

    // Key Metrics
    const metricsBoxY = yPosition;
    const metricsBoxHeight = 50;
    drawHeaderBox(doc, margin, metricsBoxY, pageWidth - (margin * 2), metricsBoxHeight, "#F9FAFB");
    drawLine(doc, margin, metricsBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, metricsBoxY + metricsBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Key Metrics", margin + 5, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Spending:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const totalSpending = analytics.totalCosts + analytics.totalExpenses;
    doc.text(formatAmount(totalSpending, currency), margin + 50, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Budget Utilization:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const utilizationColor = analytics.budgetUtilization > 100 ? [220, 38, 38] : analytics.budgetUtilization > 80 ? [234, 179, 8] : [22, 163, 74];
    doc.setTextColor(utilizationColor[0], utilizationColor[1], utilizationColor[2]);
    doc.text(`${analytics.budgetUtilization.toFixed(1)}%`, margin + 60, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Average Monthly Spending:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const avgMonthly = analytics.monthlyTrend && analytics.monthlyTrend.length > 0
      ? analytics.monthlyTrend.reduce((sum, m) => sum + m.costs + m.expenses, 0) / analytics.monthlyTrend.length
      : 0;
    doc.text(formatAmount(avgMonthly, currency), margin + 70, yPosition);

    yPosition = metricsBoxY + metricsBoxHeight + 15;

    // Top Categories
    if (analytics.topCategories && analytics.topCategories.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Top Spending Categories", margin, yPosition);
      yPosition += 12;

      const tableHeaderY = yPosition;
      const rowHeight = 8;
      drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
      drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
      
      const colWidths = [60, 50, 35];
      const headers = ["Category", "Total Amount", "Transactions"];
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      let xPos = margin + 3;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableHeaderY);
        if (i < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
        }
        xPos += colWidths[i];
      });
      
      yPosition = tableHeaderY + rowHeight;
      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "normal");
      analytics.topCategories.slice(0, 10).forEach((item, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin + 10;
        }

        if (index % 2 === 0) {
          drawHeaderBox(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight, "#F9FAFB");
        }
        drawTableBorders(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight);

        xPos = margin + 3;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        const categoryText = getCategoryLabel(item.category);
        doc.text(categoryText, xPos, yPosition);
        let colIndex = 0;
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.setFont("helvetica", "normal");
        doc.text(formatAmount(item.total, currency), xPos, yPosition);
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.text(`${item.count}`, xPos, yPosition);
        yPosition += rowHeight + 2;
      });
    }

    // Monthly Trend
    if (analytics.monthlyTrend && analytics.monthlyTrend.length > 0) {
      yPosition += 10;
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin + 10;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Trend", margin, yPosition);
      yPosition += 12;

      const tableHeaderY = yPosition;
      const rowHeight = 8;
      drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
      drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
      
      const colWidths = [40, 50, 50, 50];
      const headers = ["Month", "Costs", "Expenses", "Total"];
      
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      let xPos = margin + 3;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableHeaderY);
        if (i < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
        }
        xPos += colWidths[i];
      });
      
      yPosition = tableHeaderY + rowHeight;
      doc.setTextColor(0, 0, 0);

      doc.setFont("helvetica", "normal");
      analytics.monthlyTrend.forEach((item, index) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage();
          yPosition = margin + 10;
        }

        if (index % 2 === 0) {
          drawHeaderBox(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight, "#F9FAFB");
        }
        drawTableBorders(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight);

        xPos = margin + 3;
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.text(item.month, xPos, yPosition);
        let colIndex = 0;
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.setFont("helvetica", "normal");
        doc.text(formatAmount(item.costs, currency), xPos, yPosition);
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.text(formatAmount(item.expenses, currency), xPos, yPosition);
        if (colIndex < headers.length - 1) {
          drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
        }
        xPos += colWidths[colIndex++];

        doc.text(formatAmount(item.costs + item.expenses, currency), xPos, yPosition);
        yPosition += rowHeight + 2;
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating analytics report PDF:", error);
    throw error;
  }
}

export async function downloadInsightsReportPDF(
  costs: Cost[],
  expenses: Expense[],
  budgets: Budget[],
  analytics: FinancialAnalytics,
  insights: Array<{ type: string; title: string; message: string }>,
  title: string = "Insights Report"
) {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    const currency = costs[0]?.currency || expenses[0]?.currency || budgets[0]?.currency || "USD";

    // Executive Summary
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 45;
    drawHeaderBox(doc, margin, summaryBoxY, pageWidth - (margin * 2), summaryBoxHeight, "#F9FAFB");
    drawLine(doc, margin, summaryBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, summaryBoxY + summaryBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", margin + 5, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Spending:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const totalSpending = analytics.totalCosts + analytics.totalExpenses;
    doc.text(formatAmount(totalSpending, currency), margin + 50, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Budget Utilization:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const utilizationColor = analytics.budgetUtilization > 100 ? [220, 38, 38] : analytics.budgetUtilization > 80 ? [234, 179, 8] : [22, 163, 74];
    doc.setTextColor(utilizationColor[0], utilizationColor[1], utilizationColor[2]);
    doc.text(`${analytics.budgetUtilization.toFixed(1)}%`, margin + 60, yPosition);
    doc.setTextColor(0, 0, 0);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Key Insights:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${insights.length}`, margin + 50, yPosition);

    yPosition = summaryBoxY + summaryBoxHeight + 15;

    // Insights
    if (insights && insights.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("AI-Powered Insights", margin, yPosition);
      yPosition += 12;

      insights.forEach((insight, index) => {
        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = margin + 10;
        }

        const insightBoxY = yPosition;
        const insightBoxHeight = 35;
        const insightColor = insight.type === "warning" ? "#FEF3C7" : insight.type === "error" ? "#FEE2E2" : "#D1FAE5";
        drawHeaderBox(doc, margin, insightBoxY, pageWidth - (margin * 2), insightBoxHeight, insightColor);
        drawTableBorders(doc, margin, insightBoxY, pageWidth - (margin * 2), insightBoxHeight);

        yPosition += 8;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(insight.title, margin + 5, yPosition);
        yPosition += 8;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        const messageLines = doc.splitTextToSize(insight.message, pageWidth - margin * 2 - 10);
        doc.text(messageLines, margin + 5, yPosition);
        yPosition += messageLines.length * 5 + 5;
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating insights report PDF:", error);
    throw error;
  }
}

export async function downloadContractsPDF(contracts: Contract[], title: string = "Contracts Report") {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    // Summary Box
    const summaryBoxY = yPosition;
    const summaryBoxHeight = 40;
    drawHeaderBox(doc, margin, summaryBoxY, pageWidth - (margin * 2), summaryBoxHeight, "#F9FAFB");
    drawLine(doc, margin, summaryBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, summaryBoxY + summaryBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", margin + 5, yPosition);
    yPosition += 10;

    const total = contracts.reduce((sum, contract) => {
      const amount = typeof contract.amount === "string" ? parseFloat(contract.amount) : contract.amount;
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    const activeContracts = contracts.filter((c) => c.status === "active").length;
    const currency = contracts[0]?.currency || "USD";
    const totalFormatted = formatAmount(total, currency);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Value:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(totalFormatted, margin + 45, yPosition);
    yPosition += 7;
    
    doc.setFont("helvetica", "normal");
    doc.text(`Active Contracts:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${activeContracts} / ${contracts.length}`, margin + 60, yPosition);
    
    yPosition = summaryBoxY + summaryBoxHeight + 10;

    // Table Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Contract Details", margin, yPosition);
    yPosition += 12;

    const tableHeaderY = yPosition;
    const rowHeight = 8;
    drawHeaderBox(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight, "#1E40AF");
    drawTableBorders(doc, margin, tableHeaderY - 6, pageWidth - (margin * 2), rowHeight);
    
    const colWidths = [40, 30, 25, 25, 25, 20];
    const headers = ["Name", "Vendor", "Amount", "Status", "Start Date", "Currency"];
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    let xPos = margin + 3;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableHeaderY);
      if (i < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[i], tableHeaderY - 6, rowHeight);
      }
      xPos += colWidths[i];
    });
    
    yPosition = tableHeaderY + rowHeight;
    doc.setTextColor(0, 0, 0);

    doc.setFont("helvetica", "normal");
    contracts.forEach((contract, index) => {
      if (yPosition > pageHeight - 30) {
        doc.addPage();
        yPosition = margin + 10;
      }

      if (index % 2 === 0) {
        drawHeaderBox(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight, "#F9FAFB");
      }
      drawTableBorders(doc, margin, yPosition - 5, pageWidth - (margin * 2), rowHeight);

      const amount = typeof contract.amount === "string" ? parseFloat(contract.amount) : contract.amount;
      const amountFormatted = formatAmount(amount, contract.currency);

      xPos = margin + 3;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      const nameText = contract.name.length > 20 ? contract.name.substring(0, 18) + "..." : contract.name;
      doc.text(nameText, xPos, yPosition);
      let colIndex = 0;
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      const vendorText = contract.vendor.length > 15 ? contract.vendor.substring(0, 13) + "..." : contract.vendor;
      doc.setFont("helvetica", "normal");
      doc.text(vendorText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "bold");
      const amountText = amountFormatted.length > 12 ? amountFormatted.substring(0, 10) + "..." : amountFormatted;
      doc.text(amountText, xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFont("helvetica", "normal");
      const statusColor = contract.status === "active" ? [22, 163, 74] : contract.status === "expired" ? [220, 38, 38] : [107, 114, 128];
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.text(contract.status.charAt(0).toUpperCase() + contract.status.slice(1), xPos, yPosition);
      doc.setTextColor(0, 0, 0);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.text(formatDate(contract.startDate), xPos, yPosition);
      if (colIndex < headers.length - 1) {
        drawCellBorder(doc, xPos + colWidths[colIndex], yPosition - 5, rowHeight);
      }
      xPos += colWidths[colIndex++];
      
      doc.setFontSize(8);
      const currencyText = (contract.currency || "USD").toUpperCase();
      doc.text(currencyText, xPos, yPosition);
      yPosition += rowHeight + 2;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating contracts PDF:", error);
    throw error;
  }
}

export async function downloadDashboardPDF(data: DashboardData, title: string = "Dashboard Report") {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const headerHeight = 40;
    let yPosition = margin;

    await createPDFHeader(doc, title, pageWidth, margin, headerHeight);
    yPosition = headerHeight + 5;

    yPosition = addGenerationDate(doc, margin, yPosition);

    // Workspace Overview
    const overviewBoxY = yPosition;
    const overviewBoxHeight = 50;
    drawHeaderBox(doc, margin, overviewBoxY, pageWidth - (margin * 2), overviewBoxHeight, "#F9FAFB");
    drawLine(doc, margin, overviewBoxY, pageWidth - (margin * 2), "#E5E7EB");
    drawLine(doc, margin, overviewBoxY + overviewBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
    
    yPosition += 8;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Workspace Overview", margin + 5, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Projects:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.workspaceOverview.totalProjects}`, margin + 45, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Active Sprints:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.workspaceOverview.activeSprints}`, margin + 45, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Team Members:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.workspaceOverview.teamMembers}`, margin + 50, yPosition);
    yPosition += 7;

    doc.setFont("helvetica", "normal");
    doc.text(`Health Score:`, margin + 5, yPosition);
    doc.setFont("helvetica", "bold");
    const healthColor = data.workspaceOverview.healthScore >= 80 ? [22, 163, 74] : data.workspaceOverview.healthScore >= 60 ? [234, 179, 8] : [220, 38, 38];
    doc.setTextColor(healthColor[0], healthColor[1], healthColor[2]);
    doc.text(`${data.workspaceOverview.healthScore}%`, margin + 45, yPosition);
    doc.setTextColor(0, 0, 0);

    yPosition = overviewBoxY + overviewBoxHeight + 15;

    // Project Statistics
    if (data.projectStatistics) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Project Statistics", margin, yPosition);
      yPosition += 12;

      const statsBoxY = yPosition;
      const statsBoxHeight = 40;
      drawHeaderBox(doc, margin, statsBoxY, pageWidth - (margin * 2), statsBoxHeight, "#F9FAFB");
      drawLine(doc, margin, statsBoxY, pageWidth - (margin * 2), "#E5E7EB");
      drawLine(doc, margin, statsBoxY + statsBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Tasks:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.projectStatistics.totalTasks}`, margin + 40, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.text(`Completed Tasks:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.projectStatistics.completedTasks}`, margin + 50, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.text(`Progress:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.projectStatistics.progressPercentage}%`, margin + 40, yPosition);

      yPosition = statsBoxY + statsBoxHeight + 15;
    }

    // Budget & Cost Metrics
    if (data.budgetCostMetrics) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Budget & Cost Metrics", margin, yPosition);
      yPosition += 12;

      const budgetBoxY = yPosition;
      const budgetBoxHeight = 50;
      drawHeaderBox(doc, margin, budgetBoxY, pageWidth - (margin * 2), budgetBoxHeight, "#F9FAFB");
      drawLine(doc, margin, budgetBoxY, pageWidth - (margin * 2), "#E5E7EB");
      drawLine(doc, margin, budgetBoxY + budgetBoxHeight, pageWidth - (margin * 2), "#E5E7EB");
      
      yPosition += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Budget:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(formatAmount(data.budgetCostMetrics.totalBudget, "USD"), margin + 45, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.text(`Total Spent:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      doc.text(formatAmount(data.budgetCostMetrics.totalSpent, "USD"), margin + 45, yPosition);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.text(`Remaining Budget:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      const remainingColor = data.budgetCostMetrics.remainingBudget >= 0 ? [22, 163, 74] : [220, 38, 38];
      doc.setTextColor(remainingColor[0], remainingColor[1], remainingColor[2]);
      doc.text(formatAmount(data.budgetCostMetrics.remainingBudget, "USD"), margin + 55, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 7;

      doc.setFont("helvetica", "normal");
      doc.text(`Budget Utilization:`, margin + 5, yPosition);
      doc.setFont("helvetica", "bold");
      const utilColor = data.budgetCostMetrics.budgetUtilization > 100 ? [220, 38, 38] : data.budgetCostMetrics.budgetUtilization > 80 ? [234, 179, 8] : [22, 163, 74];
      doc.setTextColor(utilColor[0], utilColor[1], utilColor[2]);
      doc.text(`${data.budgetCostMetrics.budgetUtilization.toFixed(1)}%`, margin + 60, yPosition);
      doc.setTextColor(0, 0, 0);
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      createPDFFooter(doc, i, totalPages, pageWidth, pageHeight, margin);
    }

    doc.save(`${title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
  } catch (error) {
    console.error("Error generating dashboard PDF:", error);
    throw error;
  }
}
