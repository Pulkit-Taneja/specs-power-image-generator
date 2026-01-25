import jsPDF from 'jspdf';

/**
 * Generates and downloads a PDF prescription
 * @param {Object} prescriptionData - The prescription data
 * @param {string} prescriptionData.customerName - Customer name
 * @param {string} prescriptionData.jobCard - Job card number
 * @param {string} prescriptionData.branchName - Branch name
 * @param {string} prescriptionData.rightSph - Right spherical
 * @param {string} prescriptionData.rightCyl - Right cylindrical
 * @param {string} prescriptionData.rightAxis - Right axis
 * @param {string} prescriptionData.leftSph - Left spherical
 * @param {string} prescriptionData.leftCyl - Left cylindrical
 * @param {string} prescriptionData.leftAxis - Left axis
 * @param {string} prescriptionData.rightAddition - Right addition
 * @param {string} prescriptionData.leftAddition - Left addition
 * @param {string} prescriptionData.rightVision - Right vision
 * @param {string} prescriptionData.leftVision - Left vision
 * @param {string} prescriptionData.date - Date
 */
export const generatePrescriptionPDF = (prescriptionData = {}) => {
  try {
    const doc = new jsPDF();
    let yPos = 15;
    
    // Format power values with proper signs
    const formatPowerValue = (value) => {
      if (!value || value === '') return '';
      const num = parseFloat(value);
      if (isNaN(num)) return value;
      if (num === 0) return '0.00';
      return num > 0 ? `+${num.toFixed(2)}` : num.toFixed(2);
    };
    
    // Draw horizontal line separator
    const drawLine = (y) => {
      doc.line(20, y, 190, y);
    };
    
    // Clinic name header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Shanti Optical Works', 105, yPos, { align: 'center' });
    yPos += 3;
    
    // Line separator
    drawLine(yPos);
    yPos += 7;
    
    let addressXRight = 20
    let adddressXLeft = 150
    // Address
    doc.setFontSize(10.5);
    doc.setFont(undefined, 'bold');
    doc.text('Head Office:', addressXRight, yPos, { align: 'left' })
    doc.text('Branch:', adddressXLeft, yPos, { align: 'left' });
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text('507/15 Bara Bazar, Near Sohna Chowk', addressXRight, yPos, { align: 'left' })
    doc.text('Shop No. 29, Sector 46', adddressXLeft, yPos, { align: 'left' });
    yPos += 4;
    doc.text('Gurgaon - 122001, Haryana', addressXRight, yPos, { align: 'left' })
    doc.text('Gurgaon - 122001, Haryana', adddressXLeft, yPos, { align: 'left' });
    yPos += 4;
    doc.text('Contact: +91 9212429789', addressXRight, yPos, { align: 'left' })
    doc.text('Contact: +91 9999023789', adddressXLeft, yPos, { align: 'left' });
    yPos += 5;
    
    // Line separator
    drawLine(yPos);
    yPos += 6;
    
    // Optical Prescription title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Optical Prescription', 105, yPos, { align: 'center' });
    yPos += 3;
    
    // Line separator
    drawLine(yPos);
    yPos += 10;
    
    // Customer name and date in aligned format
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    const customerName = prescriptionData.customerName || 'N/A';
    const date = prescriptionData.date || '';
    
    // Create invisible table for alignment
    let labelWidth = 45;
    doc.text('Customer Name:', 20, yPos);
    doc.text(customerName, 20 + labelWidth, yPos);
    yPos += 5.5;
    doc.text('Date:', 20, yPos);
    doc.text(date, 20 + labelWidth, yPos);
    yPos += 7;
    
    // Line separator
    drawLine(yPos);
    yPos += 10;
    
    // Check if vision columns should be included
    const hasVision = prescriptionData.rightVision || prescriptionData.leftVision;
    
    // Table with borders
    const tableX = hasVision ? 20 : 38;
    const tableWidth = hasVision ? 170 : 134;
    const rowHeight = 10;
    labelWidth = 25;
    const eyeGroupWidth = hasVision ? 72.5 : 54.5;
    const colWidth = hasVision ? 18 : 18;
    const numCols = hasVision ? 4 : 3;
    
    // Main table border
    doc.rect(tableX, yPos, tableWidth, rowHeight * 4);
    
    // Vertical lines
    doc.line(tableX + labelWidth, yPos, tableX + labelWidth, yPos + rowHeight * 4); // After label column
    doc.line(tableX + labelWidth + eyeGroupWidth, yPos, tableX + labelWidth + eyeGroupWidth, yPos + rowHeight * 4); // Between eye groups
    
    // RIGHT EYE columns (only for rows 2-4, not the header row)
    for (let i = 1; i < numCols; i++) {
      doc.line(tableX + labelWidth + (colWidth * i), yPos + rowHeight, tableX + labelWidth + (colWidth * i), yPos + rowHeight * 4);
    }
    
    // LEFT EYE columns (only for rows 2-4, not the header row)
    for (let i = 1; i < numCols; i++) {
      doc.line(tableX + labelWidth + eyeGroupWidth + (colWidth * i), yPos + rowHeight, tableX + labelWidth + eyeGroupWidth + (colWidth * i), yPos + rowHeight * 4);
    }
    
    // Horizontal lines
    doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight); // After group headers
    doc.line(tableX, yPos + rowHeight * 2, tableX + tableWidth, yPos + rowHeight * 2); // After column headers
    doc.line(tableX, yPos + rowHeight * 3, tableX + tableWidth, yPos + rowHeight * 3); // After DISTANCE row
    
    // Group headers
    doc.setFont(undefined, 'bold');
    doc.text('RIGHT EYE', tableX + labelWidth + eyeGroupWidth/2, yPos + 6.5, { align: 'center' });
    doc.text('LEFT EYE', tableX + labelWidth + eyeGroupWidth + eyeGroupWidth/2, yPos + 6.5, { align: 'center' });
    
    // Column headers
    doc.setFontSize(10);
    doc.text('SPH', tableX + labelWidth + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    doc.text('CYL', tableX + labelWidth + colWidth + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    doc.text('AXIS', tableX + labelWidth + colWidth*2 + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    if (hasVision) {
      doc.text('VISION', tableX + labelWidth + colWidth*3 + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    }
    
    doc.text('SPH', tableX + labelWidth + eyeGroupWidth + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    doc.text('CYL', tableX + labelWidth + eyeGroupWidth + colWidth + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    doc.text('AXIS', tableX + labelWidth + eyeGroupWidth + colWidth*2 + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    if (hasVision) {
      doc.text('VISION', tableX + labelWidth + eyeGroupWidth + colWidth*3 + colWidth/2, yPos + rowHeight + 6.5, { align: 'center' });
    }
    
    // Data rows
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    // DISTANCE row
    doc.text('DISTANCE', tableX + 2, yPos + rowHeight * 2 + 6.5);
    doc.text(formatPowerValue(prescriptionData.rightSph) || '-', tableX + labelWidth + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    doc.text(formatPowerValue(prescriptionData.rightCyl) || '-', tableX + labelWidth + colWidth + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    doc.text(prescriptionData.rightAxis || '-', tableX + labelWidth + colWidth*2 + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    if (hasVision) {
      doc.text(prescriptionData.rightVision || '-', tableX + labelWidth + colWidth*3 + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    }
    
    doc.text(formatPowerValue(prescriptionData.leftSph) || '-', tableX + labelWidth + eyeGroupWidth + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    doc.text(formatPowerValue(prescriptionData.leftCyl) || '-', tableX + labelWidth + eyeGroupWidth + colWidth + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    doc.text(prescriptionData.leftAxis || '-', tableX + labelWidth + eyeGroupWidth + colWidth*2 + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    if (hasVision) {
      doc.text(prescriptionData.leftVision || '-', tableX + labelWidth + eyeGroupWidth + colWidth*3 + colWidth/2, yPos + rowHeight * 2 + 6.5, { align: 'center' });
    }
    
    // ADD row
    const rightNearVision = prescriptionData.rightAddition && hasVision ? (prescriptionData.rightVision || '6/6').replace('6/', 'N') : '';
    const leftNearVision = prescriptionData.leftAddition && hasVision ? (prescriptionData.leftVision || '6/6').replace('6/', 'N') : '';
    
    doc.text('ADD', tableX + 2, yPos + rowHeight * 3 + 6.5);
    doc.text(formatPowerValue(prescriptionData.rightAddition) || '-', tableX + labelWidth + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    doc.text('', tableX + labelWidth + colWidth + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    doc.text('', tableX + labelWidth + colWidth*2 + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    if (hasVision) {
      doc.text(rightNearVision, tableX + labelWidth + colWidth*3 + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    }
    
    doc.text(formatPowerValue(prescriptionData.leftAddition) || '-', tableX + labelWidth + eyeGroupWidth + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    doc.text('', tableX + labelWidth + eyeGroupWidth + colWidth + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    doc.text('', tableX + labelWidth + eyeGroupWidth + colWidth*2 + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    if (hasVision) {
      doc.text(leftNearVision, tableX + labelWidth + eyeGroupWidth + colWidth*3 + colWidth/2, yPos + rowHeight * 3 + 6.5, { align: 'center' });
    }
    
    // Move position below table
    yPos += rowHeight * 4 + 15;
    
    // Remarks
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const remarks = prescriptionData.remarks || '';
    doc.text(`Remarks: ${remarks}`, 20, yPos);
    
    // Generate filename
    const sanitizedCustomerName = customerName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    let filenameWithoutExtension = `Shanti Opticals - ${sanitizedCustomerName} - Optical Prescription`;
    if (prescriptionData.date) {
      filenameWithoutExtension += ` - ${prescriptionData.date}`;
    }
    const filename = `${filenameWithoutExtension}.pdf`;
    // const filename = `Shanti Opticals - ${sanitizedCustomerName} - Optical Prescription - ${prescriptionData.date || 'N/A'}.pdf`;
    
    // Download the PDF
    doc.save(filename);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};