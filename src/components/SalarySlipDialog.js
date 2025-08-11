// components/SalarySlipDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import html2pdf from 'html2pdf.js';

// Replace with your actual imports
import stampImage from '../assets/stamp.png';
import signatureImg from '../assets/signofadmin.png';
import appIcon from '../assets/logo.png';

// --- Style Definitions (No Changes) ---
const salarySlipStyle = { fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#333', padding: '20px', width: '8.5in', margin: '0 auto', backgroundColor: 'white', border: '1px solid #ddd', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '2px solid #4CAF50', paddingBottom: '10px' };
const logoContainerStyle = { display: 'flex', alignItems: 'center' };
const logoStyle = { width: '40px', height: '40px', marginRight: '8px', objectFit: 'contain' };
const therapyHomeStyle = { fontSize: '1.2em', fontWeight: 'bold', color: '#4CAF50' };
const slipNoStyle = { textAlign: 'right', fontSize: '0.9em' };
const slipNoSpanStyle = { fontWeight: 'bold' };
const infoSectionStyle = { marginBottom: '15px' };
const infoRowStyle = { display: 'flex', alignItems: 'baseline', marginBottom: '5px' };
const infoLabelStyle = { whiteSpace: 'nowrap', marginRight: '5px', fontWeight: 'bold', fontSize: '0.9em', width: '120px' };
const infoValueStyle = { borderBottom: '1px dotted #666', paddingBottom: '2px', marginLeft: '5px', flexGrow: 1, fontSize: '0.9em' };
const earningsSectionStyle = { marginTop: '20px', borderTop: '1px solid #ccc', borderBottom: '1px solid #ccc', paddingTop: '10px', paddingBottom: '10px' };
const earningsTableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = { background: '#f2f2f2', padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '0.9em' };
const tdStyle = { padding: '8px', borderBottom: '1px solid #eee', fontSize: '0.9em' };
const summarySectionStyle = { marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' };
const summaryRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '1em' };
const netSalaryStyle = { fontWeight: 'bold', fontSize: '1.1em', color: '#4CAF50' };
const signatureSectionStyle = { display: 'flex', justifyContent: 'space-between', marginTop: '50px', paddingTop: '10px', borderTop: '1px solid #ccc' };
const signatureBlockStyle = { textAlign: 'center', width: '200px', fontSize: '0.8em' };
const signatureLineStyle = { borderTop: '1px solid #333', marginTop: '0px' };
const websiteInfoStyle = { marginTop: '20px', fontSize: '0.7em', color: '#777', textAlign: 'center' };
const websiteLinkStyle = { color: '#007bff', textDecoration: 'none' };

// --- Print Styles (No Changes) ---
const getPrintStyles = () => `
    body { font-family: Arial, sans-serif; font-size: 10px; color: #333; margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #printable-salary-slip { background-color: white !important; }
    .salary-slip-print-view {
        font-family: Arial, sans-serif; font-size: 10px; color: #333; padding: 20px; width: 8.5in !important; margin: 0 auto; background-color: white !important; box-sizing: border-box; -webkit-print-color-adjust: exact; color-adjust: exact;
    }
    .salary-slip-print-view .therapy-home { color: #4CAF50 !important; }
    .salary-slip-print-view .summary-row .net-salary { color: #4CAF50 !important; }
    @media print {
        body { background-color: white !important; margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; }
        #salary-slip-dialog-actions, .no-print { display: none !important; }
        @page { size: A4 portrait; margin: 0.5in; }
    }
`;

const SalarySlipDialog = ({ open, onClose, data = {} }) => {
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [printPreviewHTML, setPrintPreviewHTML] = useState('');

    const currentData = {
        name: 'N/A', teacherID: 'N/A', phone: 'N/A', email: 'N/A', cnic: 'N/A',
        date: new Date().toISOString(), baseSalary: 0, bonus: 0, deductions: 0,
        netSalary: 0, paidAmount: 0, remark: '', invoiceID: 'N/A',
        ...data,
    };

    // ======================= MODIFIED SECTION =======================
    // This makes the component more flexible. If the incoming data has a 'salary'
    // field but not a 'baseSalary' field, we use 'salary' for the calculation.
    if (!currentData.baseSalary && currentData.salary) {
        currentData.baseSalary = currentData.salary;
    }

    // Now we calculate deductions if they weren't provided in the data.
    const grossSalary = (parseFloat(currentData.baseSalary) || 0) + (parseFloat(currentData.bonus) || 0);
    
    // If deductions are not explicitly provided, calculate them from the difference.
    if (!data.deductions && data.netSalary) {
        currentData.deductions = grossSalary - (parseFloat(data.netSalary) || 0);
    }
    // ===================== END OF MODIFIED SECTION =====================


    const preparePrintPreviewHTML = () => {
        const slipElement = document.getElementById('salary-slip-dialog');
        if (!slipElement) return "";
        const slipContentClone = slipElement.cloneNode(true);
        slipContentClone.id = "printable-salary-slip";
        slipContentClone.classList.add('salary-slip-print-view');
        return slipContentClone.outerHTML;
    };

    const handleShowPrintPreview = () => {
        const html = preparePrintPreviewHTML();
        if (html) {
            setPrintPreviewHTML(html);
            setShowPrintPreview(true);
        }
    };

    const handleActualPrintFromPreview = () => {
        if (!printPreviewHTML) return;
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Salary Slip</title><style>${getPrintStyles()}</style></head><body>${printPreviewHTML}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
    };

    const handleDownload = () => {
        const slipHTML = preparePrintPreviewHTML();
        if (!slipHTML) return;
        const tempRenderDiv = document.createElement('div');
        tempRenderDiv.innerHTML = slipHTML;
        const opt = {
            margin: [0.5, 0.2, 0.5, 0.2],
            filename: `salary-slip-${currentData.name.replace(/\s/g, '_')}-${currentData.invoiceID}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        };
        html2pdf().from(tempRenderDiv).set(opt).save();
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen>
                <Box sx={{ p: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto', bgcolor: 'grey.200' }}>
                    <DialogContent sx={{ padding: 0, width: 'auto', maxWidth: 'initial', overflow: 'visible' }}>
                        <div id="salary-slip-dialog" style={salarySlipStyle}>
                            <header style={headerStyle}>
                                <div style={logoContainerStyle}>
                                    <img src={appIcon} alt="Logo" style={logoStyle} />
                                    <div style={therapyHomeStyle}>THERAPY HOME</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.8em', color: '#555' }}>
                                        {new Date().toLocaleString('en-US', {
                                            dateStyle: 'long',
                                            timeStyle: 'short',
                                        })}
                                    </div>
                                    <div style={slipNoStyle}>
                                        Invoice Number# <span style={slipNoSpanStyle}>{currentData.invoiceID}</span>
                                    </div>
                                </div>
                            </header>

                            <div style={{ textAlign: 'center', margin: '10px 0 20px 0' }}>
                                <h3 style={{ margin: 0, textTransform: 'uppercase' }}>Salary Slip for the month of {new Date(currentData.date).toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                            </div>

                            <section style={infoSectionStyle}>
                                <div style={infoRowStyle}>
                                    <div style={infoLabelStyle}>Employee Name:</div>
                                    <div style={infoValueStyle}>{currentData.name}</div>
                                </div>
                                <div style={infoRowStyle}>
                                    <div style={infoLabelStyle}>Email Address:</div>
                                    <div style={infoValueStyle}>{currentData.email}</div>
                                </div>
                                <div style={infoRowStyle}>
                                    <div style={infoLabelStyle}>Phone Number:</div>
                                    <div style={infoValueStyle}>{currentData.phone}</div>
                                </div>
                                <div style={infoRowStyle}>
                                    <div style={infoLabelStyle}>CNIC:</div>
                                    <div style={infoValueStyle}>{currentData.cnic}</div>
                                </div>
                            </section>

                            <section style={earningsSectionStyle}>
                                <table style={earningsTableStyle}>
                                    <thead>
                                        <tr>
                                            <th style={thStyle}>Earnings</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Amount (PKR)</th>
                                            <th style={thStyle}>Deductions</th>
                                            <th style={{ ...thStyle, textAlign: 'right' }}>Amount (PKR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td style={tdStyle}>Base Salary</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{parseFloat(currentData.baseSalary || 0).toFixed(2)}</td>
                                            <td style={tdStyle}>Deductions</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{parseFloat(currentData.deductions || 0).toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td style={tdStyle}>Bonus</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{parseFloat(currentData.bonus || 0).toFixed(2)}</td>
                                            <td style={tdStyle}></td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}></td>
                                        </tr>
                                        <tr style={{ fontWeight: 'bold' }}>
                                            <td style={tdStyle}>Gross Salary</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{grossSalary.toFixed(2)}</td>
                                            <td style={tdStyle}>Total Deductions</td>
                                            <td style={{ ...tdStyle, textAlign: 'right' }}>{parseFloat(currentData.deductions || 0).toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            <section style={summarySectionStyle}>
                                <div style={summaryRowStyle}>
                                    <span><strong>Paid Amount:</strong></span>
                                    <span>{parseFloat(currentData.paidAmount || 0).toFixed(2)} PKR</span>
                                </div>
                                <div style={summaryRowStyle}>
                                    <span><strong>Net Salary Payable:</strong></span>
                                    <span style={netSalaryStyle}>{parseFloat(currentData.netSalary || 0).toFixed(2)} PKR</span>
                                </div>
                                {currentData.remark && (
                                    <div style={{ ...summaryRowStyle, borderTop: '1px solid #ddd', marginTop: '5px', paddingTop: '5px' }}>
                                        <span><strong>Remarks:</strong></span>
                                        <span>{currentData.remark}</span>
                                    </div>
                                )}
                            </section>

                            <footer style={signatureSectionStyle}>
                                <div style={signatureBlockStyle}>
                                    <div style={{ position: 'relative', height: '80px', marginBottom: '5px' }}>
                                        <img src={stampImage} alt="Stamp" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '70px', height: '70px', opacity: 0.7, zIndex: 1 }} />
                                        <img src={signatureImg} alt="Signature" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-10deg)', width: '120px', height: 'auto', opacity: 0.9, zIndex: 2 }} />
                                    </div>
                                    <div style={signatureLineStyle}></div>
                                    Admin Signature
                                </div>
                                <div style={signatureBlockStyle}>
                                    <div style={{ height: '85px' }}></div>
                                    <div style={signatureLineStyle}></div>
                                    Employee Signature
                                </div>
                            </footer>

                            <div style={websiteInfoStyle}>
                                Website: <a href="http://www.therapyhome.com.pk" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>www.therapyhome.com.pk</a> | Email: <a href="mailto:therapyhome@gmail.com" style={websiteLinkStyle}>therapyhome@gmail.com</a>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions id="salary-slip-dialog-actions" sx={{ pt: 2, justifyContent: 'center', width: '100%', maxWidth: '8.5in' }}>
                        <Button onClick={onClose} variant="outlined">Close</Button>
                        <Button onClick={handleShowPrintPreview} color="primary" variant="contained">Print</Button>
                        <Button onClick={handleDownload} color="secondary" variant="contained">Download PDF</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={showPrintPreview} onClose={() => setShowPrintPreview(false)} fullWidth maxWidth="lg">
                <DialogTitle>Print Preview <Button onClick={handleActualPrintFromPreview} color="primary" variant="contained" sx={{ position: 'absolute', right: 16, top: 12 }} className="no-print" >Print Now</Button></DialogTitle>
                <DialogContent dividers>
                    <style>{getPrintStyles()}</style>
                    <div id="print-preview-render-area" dangerouslySetInnerHTML={{ __html: printPreviewHTML }} style={{ zoom: 0.7, overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#e0e0e0' }} />
                </DialogContent>
                <DialogActions className="no-print"><Button onClick={() => setShowPrintPreview(false)}>Close Preview</Button></DialogActions>
            </Dialog>
        </>
    );
};

export default SalarySlipDialog;