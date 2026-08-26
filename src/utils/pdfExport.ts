import { jsPDF } from 'jspdf';
import { PhysicsSolution } from '../types';

/**
 * Utility to convert raw LaTeX expressions into clean, legible Unicode physics text
 * suitable for standard PDF typography.
 */
export function cleanLatexForPdf(latex: string): string {
  if (!latex) return '';

  let text = latex;

  // Remove KaTeX/LaTeX formatting tags
  text = text.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  text = text.replace(/\\text\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  text = text.replace(/\\mathit\{([^}]+)\}/g, '$1');
  text = text.replace(/\\displaystyle/g, '');
  text = text.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  text = text.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  text = text.replace(/\\left\{/g, '{').replace(/\\right\}/g, '}');

  // Fractions: \frac{num}{den} -> (num) / (den)
  text = text.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1) / ($2)');

  // Square roots: \sqrt{x} -> √(x)
  text = text.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Common physics symbols & greek letters
  text = text.replace(/\\Delta/g, 'Δ');
  text = text.replace(/\\theta/g, 'θ');
  text = text.replace(/\\mu_k/g, 'μ_k');
  text = text.replace(/\\mu_s/g, 'μ_s');
  text = text.replace(/\\mu/g, 'μ');
  text = text.replace(/\\Sigma/g, 'Σ');
  text = text.replace(/\\sigma/g, 'σ');
  text = text.replace(/\\omega/g, 'ω');
  text = text.replace(/\\alpha/g, 'α');
  text = text.replace(/\\beta/g, 'β');
  text = text.replace(/\\pi/g, 'π');
  text = text.replace(/\\tau/g, 'τ');
  text = text.replace(/\\lambda/g, 'λ');
  text = text.replace(/\\approx/g, '≈');
  text = text.replace(/\\cdot/g, ' · ');
  text = text.replace(/\\times/g, ' × ');
  text = text.replace(/\\pm/g, '±');
  text = text.replace(/\\le/g, '≤');
  text = text.replace(/\\ge/g, '≥');
  text = text.replace(/\\degree/g, '°');
  text = text.replace(/\^\\circ/g, '°');
  text = text.replace(/\\circ/g, '°');

  // Superscripts
  text = text.replace(/\^2/g, '²');
  text = text.replace(/\^3/g, '³');
  text = text.replace(/\^0/g, '⁰');
  text = text.replace(/\^1/g, '¹');
  text = text.replace(/\^4/g, '⁴');
  text = text.replace(/\^5/g, '⁵');
  text = text.replace(/\^6/g, '⁶');
  text = text.replace(/\^7/g, '⁷');
  text = text.replace(/\^8/g, '⁸');
  text = text.replace(/\^9/g, '⁹');
  text = text.replace(/\^\{-1\}/g, '⁻¹');
  text = text.replace(/\^\{-2\}/g, '⁻²');
  text = text.replace(/\^\{2\}/g, '²');
  text = text.replace(/\^\{3\}/g, '³');

  // Subscripts
  text = text.replace(/_0/g, '₀');
  text = text.replace(/_1/g, '₁');
  text = text.replace(/_2/g, '₂');
  text = text.replace(/_x/g, 'ₓ');
  text = text.replace(/_y/g, 'ᵧ');
  text = text.replace(/_k/g, 'ₖ');
  text = text.replace(/_s/g, 'ₛ');
  text = text.replace(/_\{net\}/g, '_net');
  text = text.replace(/_\{avg\}/g, '_avg');
  text = text.replace(/_\{max\}/g, '_max');
  text = text.replace(/_\{min\}/g, '_min');
  text = text.replace(/_\{init\}/g, '_init');
  text = text.replace(/_\{final\}/g, '_final');

  // Spacing commands
  text = text.replace(/\\quad/g, '   ');
  text = text.replace(/\\qquad/g, '      ');
  text = text.replace(/\\,/g, ' ');
  text = text.replace(/\\;/g, ' ');
  text = text.replace(/\\!/g, '');
  text = text.replace(/\\\\/g, '\n');
  text = text.replace(/\\/g, ''); // strip any leftover backslashes

  // Clean double spaces
  text = text.replace(/ +/g, ' ').trim();

  return text;
}

export interface PdfExportOptions {
  solution: PhysicsSolution;
  language?: 'en' | 'bn';
  gravity?: number;
}

/**
 * Generates and downloads a clean, publication-quality printable PDF physics report.
 */
export function exportSolutionToPdf({ solution, language = 'en', gravity = 9.8 }: PdfExportOptions): void {
  const isBn = language === 'bn';
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const bottomMargin = 18;

  let currentY = margin;

  // Helper for page break checks
  function checkPageBreak(neededHeight: number): void {
    if (currentY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      currentY = margin;
      drawPageHeaderMini();
    }
  }

  function drawPageHeaderMini(): void {
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, currentY, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('PhysiStep | High School Physics Solution Report', margin + 3, currentY + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(`Topic: ${solution.category || 'Physics'}`, margin + contentWidth - 3, currentY + 4.2, { align: 'right' });
    currentY += 10;
  }

  // --- 1. Top Modern Header Banner ---
  // Top primary gradient banner simulation
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');

  // Accent cyan strip on top left of banner
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.roundedRect(margin, currentY, 4, 24, 1.5, 1.5, 'F');

  // Brand text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('PhysiStep', margin + 8, currentY + 9);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('High School Physics Mathematical Solution & Laboratory Derivation', margin + 8, currentY + 16);

  // Metadata pills on right side of banner
  const today = new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 182, 212);
  doc.text(`CATEGORY: ${(solution.category || 'PHYSICS').toUpperCase()}`, margin + contentWidth - 6, currentY + 8.5, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${today}  |  g = ${gravity} m/s²`, margin + contentWidth - 6, currentY + 15.5, { align: 'right' });

  currentY += 28;

  // --- 2. Title & Problem Statement ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // slate-900
  const titleText = solution.title || (isBn ? 'পদার্থবিজ্ঞানের গাণিতিক সমাধান' : 'Physics Problem Mathematical Derivation');
  doc.text(titleText, margin, currentY);
  currentY += 5.5;

  // Problem Summary Box
  if (solution.problemSummary) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const summaryLines = doc.splitTextToSize(solution.problemSummary, contentWidth - 10);
    const boxHeight = summaryLines.length * 4.5 + 8;

    checkPageBreak(boxHeight + 4);

    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    doc.setTextColor(51, 65, 85); // slate-700
    doc.text(summaryLines, margin + 5, currentY + 5.5);
    currentY += boxHeight + 6;
  }

  // --- 3. Given Quantities & Target Unknowns (Side-by-side or stacked cards) ---
  checkPageBreak(35);

  const halfWidth = (contentWidth - 6) / 2;
  const col1X = margin;
  const col2X = margin + halfWidth + 6;

  // Left Column: Given Known Quantities
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(isBn ? '১. প্রদত্ত জানা রাশিসমূহ (Givens)' : '1. Given Known Quantities (SI Converted)', col1X, currentY);

  // Right Column: Target Unknowns & Principles
  doc.text(isBn ? '২. নির্ণেয় রাশি ও সূত্রাবলি (Unknowns & Laws)' : '2. Target Unknowns & Principles', col2X, currentY);
  currentY += 4;

  let givensTextLines: string[] = [];
  solution.givens.forEach((g) => {
    const symbolStr = cleanLatexForPdf(g.symbol);
    const line = `• ${g.name} (${symbolStr}) = ${g.value} ${g.unit}${g.conversionNote ? ` [${g.conversionNote}]` : ''}`;
    givensTextLines.push(...doc.splitTextToSize(line, halfWidth - 6));
  });
  if (givensTextLines.length === 0) {
    givensTextLines = ['• None specified'];
  }

  let unknownsTextLines: string[] = [];
  solution.unknowns.forEach((u) => {
    const symbolStr = cleanLatexForPdf(u.symbol);
    const line = `• ${u.name} (${symbolStr}) -> Target Unit: [${u.targetUnit}]`;
    unknownsTextLines.push(...doc.splitTextToSize(line, halfWidth - 6));
  });

  if (solution.principlesUsed && solution.principlesUsed.length > 0) {
    unknownsTextLines.push('');
    unknownsTextLines.push('Applied Principles:');
    solution.principlesUsed.forEach((p) => {
      unknownsTextLines.push(`- ${p}`);
    });
  }

  const leftBoxH = givensTextLines.length * 4.2 + 6;
  const rightBoxH = unknownsTextLines.length * 4.2 + 6;
  const maxCardH = Math.max(leftBoxH, rightBoxH, 20);

  // Left card background
  doc.setFillColor(240, 249, 255); // sky-50
  doc.setDrawColor(186, 230, 253); // sky-200
  doc.roundedRect(col1X, currentY, halfWidth, maxCardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(givensTextLines, col1X + 4, currentY + 5);

  // Right card background
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(col2X, currentY, halfWidth, maxCardH, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(unknownsTextLines, col2X + 4, currentY + 5);

  currentY += maxCardH + 8;

  // --- 4. Step-by-Step Derivations ---
  checkPageBreak(15);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(isBn ? '৩. ধাপে ধাপে গাণিতিক প্রতিপাদন (Step-by-Step Derivations)' : '3. Step-by-Step Mathematical Derivations', margin, currentY);
  currentY += 5;

  solution.steps.forEach((step, idx) => {
    // Calculate heights
    const stepTitle = `${isBn ? 'ধাপ' : 'Step'} ${step.stepNumber}: ${step.title}`;
    const cleanFormula = cleanLatexForPdf(step.formulaLatex);
    const cleanAlgebra = step.algebraicDerivation ? cleanLatexForPdf(step.algebraicDerivation) : '';
    const cleanSubstitution = cleanLatexForPdf(step.substitutionLatex);
    const cleanResult = step.calculatedResult;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const explanationLines = doc.splitTextToSize(step.explanation, contentWidth - 10);

    let estHeight = 12 + explanationLines.length * 4.2;
    if (cleanFormula) estHeight += 9;
    if (cleanAlgebra && cleanAlgebra !== cleanFormula) estHeight += 8;
    if (cleanSubstitution) estHeight += 9;
    if (cleanResult) estHeight += 9;
    estHeight += 6;

    checkPageBreak(estHeight);

    // Draw step container
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.roundedRect(margin, currentY, contentWidth, estHeight, 2, 2, 'FD');

    // Step Header Pill Bar
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, currentY, contentWidth, 7.5, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(stepTitle, margin + 4, currentY + 5.2);

    let innerY = currentY + 12;

    // Explanation
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(explanationLines, margin + 4, innerY);
    innerY += explanationLines.length * 4.2 + 2;

    // Governing formula line
    if (cleanFormula) {
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin + 4, innerY, contentWidth - 8, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(2, 132, 199); // sky-600
      doc.text(`Governing Equation:   ${cleanFormula}`, margin + 7, innerY + 4.5);
      innerY += 8.5;
    }

    // Algebraic Isolation if present
    if (cleanAlgebra && cleanAlgebra !== cleanFormula) {
      doc.setFillColor(238, 242, 255); // indigo-50
      doc.roundedRect(margin + 4, innerY, contentWidth - 8, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(79, 70, 229); // indigo-600
      doc.text(`Algebraic Isolation:   ${cleanAlgebra}`, margin + 7, innerY + 4.5);
      innerY += 8.5;
    }

    // Numerical Substitution
    if (cleanSubstitution) {
      doc.setFillColor(240, 253, 250); // teal-50
      doc.roundedRect(margin + 4, innerY, contentWidth - 8, 6.5, 1, 1, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text(`Substitution:   ${cleanSubstitution}`, margin + 7, innerY + 4.5);
      innerY += 8.5;
    }

    // Step Result
    if (cleanResult) {
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.setDrawColor(167, 243, 208); // emerald-200
      doc.roundedRect(margin + 4, innerY, contentWidth - 8, 6.5, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(5, 150, 105); // emerald-600
      doc.text(`Intermediate Result: ${cleanResult}`, margin + 7, innerY + 4.5);
      innerY += 8.5;
    }

    currentY += estHeight + 4;
  });

  // --- 5. Final Mathematical Results Box ---
  const finalAnsCount = solution.finalAnswers?.length || 1;
  const ansBoxEstH = 16 + finalAnsCount * 12;
  checkPageBreak(ansBoxEstH + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(isBn ? '৪. চূড়ান্ত গাণিতিক ফলাফল (Final Results)' : '4. Final Mathematical Results', margin, currentY);
  currentY += 4.5;

  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(74, 222, 128); // emerald-400
  doc.roundedRect(margin, currentY, contentWidth, ansBoxEstH, 2.5, 2.5, 'FD');

  let ansInnerY = currentY + 6;
  solution.finalAnswers.forEach((ans) => {
    const symbolStr = cleanLatexForPdf(ans.symbol);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(21, 128, 61); // emerald-700
    doc.text(`• ${ans.quantity} (${symbolStr}) = ${ans.value} ${ans.unit}${ans.scientificNotation ? `  [≈ ${ans.scientificNotation} ${ans.unit}]` : ''}`, margin + 6, ansInnerY);

    if (ans.interpretation) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // slate-600
      const interpLines = doc.splitTextToSize(`Interpretation: ${ans.interpretation}`, contentWidth - 16);
      doc.text(interpLines, margin + 9, ansInnerY + 4.5);
      ansInnerY += 4.5 + interpLines.length * 3.8;
    } else {
      ansInnerY += 8;
    }
  });

  currentY += ansBoxEstH + 6;

  // --- 6. Sanity Check & Pitfalls ---
  if (solution.sanityCheck || (solution.commonPitfalls && solution.commonPitfalls.length > 0)) {
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text(isBn ? '৫. পদার্থবিজ্ঞানের ব্যাখ্যা ও সতর্কতা (Intuition & Pitfalls)' : '5. Physical Sanity Check & Exam Traps', margin, currentY);
    currentY += 4.5;

    // Sanity check box
    if (solution.sanityCheck) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const sanityLines = doc.splitTextToSize(`Sanity & Dimensional Check: ${solution.sanityCheck}`, contentWidth - 10);
      const sBoxH = sanityLines.length * 4 + 6;
      checkPageBreak(sBoxH + 4);

      doc.setFillColor(240, 249, 255); // sky-50
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(margin, currentY, contentWidth, sBoxH, 2, 2, 'FD');
      doc.setTextColor(3, 105, 161);
      doc.text(sanityLines, margin + 5, currentY + 4.5);
      currentY += sBoxH + 4;
    }

    // Common pitfalls
    if (solution.commonPitfalls && solution.commonPitfalls.length > 0) {
      const pitfallLines: string[] = [];
      solution.commonPitfalls.forEach((p) => {
        pitfallLines.push(...doc.splitTextToSize(`• ${p}`, contentWidth - 10));
      });
      const pBoxH = pitfallLines.length * 4 + 6;
      checkPageBreak(pBoxH + 4);

      doc.setFillColor(254, 252, 232); // yellow-50
      doc.setDrawColor(254, 240, 138);
      doc.roundedRect(margin, currentY, contentWidth, pBoxH, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(161, 98, 7); // yellow-700
      doc.text(pitfallLines, margin + 5, currentY + 4.5);
      currentY += pBoxH + 6;
    }
  }

  // --- 7. Number All Pages in Footer ---
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Separator line
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 12, margin + contentWidth, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('PhysiStep | High School Physics Math Solver & Laboratory Suite', margin, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, margin + contentWidth, pageHeight - 7, { align: 'right' });
  }

  // Format file name based on problem title or category
  const sanitizedTitle = (solution.title || solution.category || 'physics-solution')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const fileName = `PhysiStep-${sanitizedTitle || 'solution'}.pdf`;

  // Trigger download in browser
  doc.save(fileName);
}
