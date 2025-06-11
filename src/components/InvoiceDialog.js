// components/InvoiceDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import html2pdf from 'html2pdf.js';

// Replace with your actual imports
import stampImage from '../assets/stamp.png';
import appIcon from '../assets/logo.png';

// Data for the Terms Page
const termsData = [
    { id: 'a', title: "Admission and Security Deposit", english: "The finalized Admission fees and security deposit must be submitted to confirm your child's enrollment or to confirm your therapy slotting.", urdu: "آپ کے بچے کے داخلے کی تصدیق یا آپ کی تھراپی کی سلاٹنگ کی تصدیق کے لیے حتمی داخلہ فیس اور سیکیورٹی ڈپازٹ جمع کروانا ضروری ہے۔" },
    { id: 'b', title: "Payment and Procedures", english: `Parents can submit fees through the following options:\n1. Cash Payment\n2. Online Transfer (Please share the online slip with us).\n\nBank: Meezan Bank\nTitle: THERAPY HOME\nAccount No: 0156-0109649823`, urdu: `والدین درج ذیل طریقوں سے فیس جمع کروا سکتے ہیں:\n1. نقد ادائیگی\n2. آن لائن ٹرانسفر (براہ کرم آن لائن سلپ ہمیں فراہم کریں)\n\nبینک: میزان بینک\nاکاؤنٹ ٹائٹل: تھراپی ہوم\nاکاؤنٹ نمبر: 0156-0109649823` },
    { id: 'c', title: "Mid-Month Admissions / Enrollment", english: "If the child begins therapy in the middle of the month, fees will be charged for the remaining days in that month. The fee for the subsequent month should be paid in full between the 1st to 7th of each month.", urdu: "اگر بچہ ماہ کے درمیان میں تھراپی شروع کرتا ہے، تو اس ماہ کے باقی دنوں کی فیس وصول کی جائے گی۔ آئندہ ماہ کی فیس مکمل طور پر ہر ماہ کی 1 تاریخ سے 7 تاریخ کے درمیان ادا کی جائے گی۔" },
    { id: 'd', title: "Delayed Payment", english: "All payments must be made between the 1st and 7th of each month. Any payments submitted after the 7th will incur a penalty. It is the responsibility of individuals to settle dues promptly to avoid additional charges.", urdu: "تمام ادائیگیاں ہر مہینے کے پہلے سے لے کر ساتویں تاریخ کے درمیان کی جانی چاہئیں۔ ساتویں تاریخ کے بعد جمع شدہ کوئی بھی ادائیگی جرمانہ کا حصہ بنے گی۔ افراد کا فرض ہے کہ واجبات کو بروقت ادا کریں تاکہ اضافی چارجز سے بچا جا سکے۔" },
    { id: 'e', title: "Session Leave and Re-Admission", english: "In the event of leaving the session for any reason or not continuing for a certain period, admission will be canceled, and rejoining the session will be subject to re-admission procedures.", urdu: "اگر کسی بھی وجہ سے آپ سیشن چھوڑ دیتے ہیں یا کسی مخصوص مدت کے لیے جاری نہیں رکھتے تو داخلہ منسوخ کر دیا جائے گا اور دوبارہ شمولیت دوبارہ داخلے کے طریقہ کار سے مشروط ہوگی۔" },
    { id: 'f', title: "Fee Policy for Monthly Breaks", urdu: "اگر والدین کسی بھی وجہ سے ایک مہینے کے لیے سیشنز سے وقفہ یا توقف اختیار کرنا چاہیں، تو درج ذیل فیس پالیسی لاگو ہوگی:\nآئی ای پی (IEP) یا فن اینڈ لرن پروگرام میں شامل والدین کو مہینے کی پوری پروگرام فیس ادا کرنی ہوگی۔\nانفرادی سیشنز (one-on-one sessions) لینے والے والدین کو ماہانہ فیس کا 50 فیصد ادا کرنا ہوگا۔\nوقت: براہ کرم طے شدہ سیشن یا مشاورتی ملاقاتوں کے لیے وقت پر پہنچیں اور تھراپسٹ کے شیڈول کا خیال رکھیں۔\nتلافی:\n۱۔ حاضری فائل: براہ کرم یقینی بنائیں کہ طالب علم کی حاضری، حاضری فائل میں درج کی گئی ہے، تب ہی ہم آپ کو تلافی سیشن فراہم کریں گے۔ اگر آپ حاضری درج نہیں کریں گے، تو ہم تلافی سیشن فراہم نہیں کر سکیں گے۔\n۲۔ غیر حاضری کی اطلاع: براہ کرم یقینی بنائیں کہ اگر آپ سیشن کے دن چھٹی کرنا چاہتے ہیں یا غیر حاضر رہنا چاہتے ہیں تو سیشن سے ۳۰ منٹ قبل مطلع کریں۔ تب ہی ہم آپ کو تلافی سیشن فراہم کریں گے۔ اگر آپ سیشن سے ۳۰ منٹ قبل مطلع نہیں کریں گے، تو ہم تلافی سیشن فراہم نہیں کر سکیں گے۔", english: "If parents choose to take a break or pause sessions for one month for any reason, the following fee policy will apply:\nParents enrolled in the IEP or Fun & Learn program will be required to pay the full program fee for the month.\nParents utilizing one-on-one sessions will be required to pay 50% of the monthly fee.\nTime: Please arrive on time for session scheduled or consultancy appointments and be mindful of the therapist's schedule.\nCompensate:\n1. Attendance File: Please ensure to mark the student attendance in the attendance file, then we will provide you the compensate session if you don’t mark the attendance, we will not be able to provide compensate.\n2. Absent information: Please ensure to inform 30 mints before the session if you want to leave or absent on that session day. then we will provide you the compensate session if you don’t inform 30 mints before the session, we will not be able to provide compensate." }
];
const translateTitle = (title) => {
    const map = {
      "Admission and Security Deposit": "داخلہ اور سیکیورٹی ڈپازٹ",
      "Payment and Procedures": "ادائیگی اور طریقہ کار",
      "Mid-Month Admissions / Enrollment": "ماہ کے درمیان داخلہ / اندراج",
      "Delayed Payment": "تاخیر شدہ ادائیگی",
      "Session Leave and Re-Admission": "سیشن چھٹی اور دوبارہ داخلہ",
      "Fee Policy for Monthly Breaks": "ماہانہ وقفوں کے لیے فیس پالیسی"
    };
    return map[title] || title;
};

// Original Style definitions (ensure these are complete as in your working version)
const invoiceStyle = { fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#333', padding: '20px', width: '8.5in', margin: '0 auto', backgroundColor: 'white', clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)', boxSizing: 'border-box', };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', };
const logoContainerStyle = { display: 'flex', alignItems: 'center' };
const logoStyle = { width: '40px', height: '40px', marginRight: '8px', objectFit: 'contain' };
const therapyHomeStyle = { fontSize: '1em', fontWeight: 'bold', color: '#ff9800' };
const slipNoStyle = { textAlign: 'right', fontSize: '0.8em' };
const slipNoSpanStyle = { fontWeight: 'bold' };
const infoSectionStyle = { marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '8px' };
const infoRowStyle = { display: 'flex', alignItems: 'baseline', marginBottom: '3px' };
const infoLabelStyle = { whiteSpace: 'nowrap', marginRight: '3px', fontWeight: 'bold', fontSize: '0.9em' };
const infoValueStyle = { borderBottom: '1px dotted #666', paddingBottom: '1px', marginLeft: '3px', flexGrow: 1, fontSize: '0.9em', minWidth: '50px' };
const feeLabelStyle = { whiteSpace: 'nowrap', marginRight: '3px', fontSize: '0.9em' };
const feeValueStyle = { borderBottom: '1px dotted #666', paddingBottom: '1px', marginLeft: '3px', fontSize: '0.9em', flexGrow: 1, minWidth: '50px' };
const balanceLabelStyle = { whiteSpace: 'nowrap', marginRight: '3px', fontWeight: 'bold', fontSize: '0.9em' };
const balanceValueStyle = { borderBottom: '1px dotted #666', paddingBottom: '1px', marginLeft: '3px', width: '80px', textAlign: 'right', fontSize: '0.9em' };
const stampSignatureStyle = { display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '0.7em' };
const stampContainerStyle = { textAlign: 'left' };
const stampStyle = { width: '60px', height: '60px', marginTop: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const stampImageStyle = { maxWidth: '100%', maxHeight: '100%', opacity: '0.7', objectFit: 'contain', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' };
const signatureContainerStyle = { textAlign: 'right' };
const signatureLineStyle = { marginTop: '10px', borderBottom: '1px dotted #666', width: '100px', display: 'inline-block' };
const noteStyle = { marginTop: '10px', fontSize: '0.6em', color: '#777', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' };
const noteStrongStyle = { color: 'red', fontWeight: 'bold', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' };
const websiteInfoStyle = { marginTop: '8px', fontSize: '0.6em', color: '#777', textAlign: 'center', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' };
const websiteLinkStyle = { color: '#007bff', textDecoration: 'none', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' };

// Meticulously Scoped Print Styles
const getPrintStyles = () => `
    body { font-family: Arial, sans-serif; font-size: 10px; color: #333; margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #printable-area-wrapper { background-color: white !important; }
    #invoice-content, .invoice-dialog-print-view { font-family: Arial, sans-serif; font-size: 10px; color: #333; padding: 20px; width: 8.5in !important; margin: 0 auto; background-color: white !important; clip-path: polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%); box-sizing: border-box; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .header, .invoice-dialog-print-view .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    #invoice-content .logo-container, .invoice-dialog-print-view .logo-container { display: flex; align-items: center; }
    #invoice-content .logo, .invoice-dialog-print-view .logo { width: 40px; height:40px; margin-right: 8px; object-fit: contain; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .therapy-home, .invoice-dialog-print-view .therapy-home { font-size: 1em; font-weight: bold; color: #ff9800 !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .slip-no, .invoice-dialog-print-view .slip-no { text-align: right; font-size: 0.8em; }
    #invoice-content .slip-no span, .invoice-dialog-print-view .slip-no span { font-weight: bold; }
    #invoice-content .info-section, .invoice-dialog-print-view .info-section { margin-bottom: 8px; border-bottom: 1px solid #ccc; padding-bottom: 8px; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .info-row, .invoice-dialog-print-view .info-row { display: flex; align-items: baseline; margin-bottom: 3px; }
    #invoice-content .info-label, .invoice-dialog-print-view .info-label { white-space: nowrap; margin-right: 3px; font-weight: bold; font-size: 0.9em; }
    #invoice-content .info-value, .invoice-dialog-print-view .info-value { border-bottom: 1px dotted #666; padding-bottom: 1px; margin-left: 3px; flex-grow: 1; font-size: 0.9em; min-width: 50px; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .fee-label, .invoice-dialog-print-view .fee-label { white-space: nowrap; margin-right: 3px; font-size: 0.9em; }
    #invoice-content .fee-value, .invoice-dialog-print-view .fee-value { border-bottom: 1px dotted #666; padding-bottom: 1px; margin-left: 3px; font-size: 0.9em; flex-grow: 1; min-width: 50px; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .balance-label, .invoice-dialog-print-view .balance-label { white-space: nowrap; margin-right: 3px; font-weight: bold; font-size: 0.9em; }
    #invoice-content .balance-value, .invoice-dialog-print-view .balance-value { border-bottom: 1px dotted #666; padding-bottom: 1px; margin-left: 3px; width: 80px; text-align: right; font-size: 0.9em; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .stamp-signature, .invoice-dialog-print-view .stamp-signature { display: flex; justify-content: space-between; margin-top: 20px; font-size: 0.7em; }
    #invoice-content .stamp-container, .invoice-dialog-print-view .stamp-container { text-align: left; }
    #invoice-content .stamp, .invoice-dialog-print-view .stamp { width: 60px; height: 60px; margin-top: 3px; display:flex; align-items:center; justify-content:center; }
    #invoice-content .stamp img, .invoice-dialog-print-view .stamp img { max-width: 100%; max-height: 100%; object-fit: contain; opacity: 0.7; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .signature-container, .invoice-dialog-print-view .signature-container { text-align: right; }
    #invoice-content .signature-line, .invoice-dialog-print-view .signature-line { margin-top: 10px; border-bottom: 1px dotted #666; width: 100px; display: inline-block; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .note, .invoice-dialog-print-view .note { margin-top: 10px; font-size: 0.6em; color: #777 !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .note strong, .invoice-dialog-print-view .note strong { color: red !important; font-weight: bold; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .website-info, .invoice-dialog-print-view .website-info { margin-top: 8px; font-size: 0.6em; color: #777 !important; text-align: center; -webkit-print-color-adjust: exact; color-adjust: exact; }
    #invoice-content .website-info a, .invoice-dialog-print-view .website-info a { color: #007bff !important; text-decoration: none; -webkit-print-color-adjust: exact; color-adjust: exact; }

    .terms-page-container { page-break-before: always !important; padding: 20px; font-family: Arial, sans-serif; font-size: 10px; color: #333; width: 8.5in !important; margin: 20px auto 0 auto; box-sizing: border-box; background-color: white !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .terms-page-container h2 { text-align: center; font-weight: bold; margin-bottom: 20px; font-size: 1.2em; }
    .terms-page-container .term-item-pdf { margin-bottom: 15px; border: 1px solid #ccc; border-radius: 8px; padding: 10px; overflow: auto; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .terms-page-container .term-item-pdf .english-col-pdf { width: 48%; float: left; padding-right: 2%; box-sizing: border-box; }
    .terms-page-container .term-item-pdf .urdu-col-pdf { width: 48%; float: right; padding-left: 2%; text-align: right; direction: rtl; box-sizing: border-box; }
    .terms-page-container .term-item-pdf h3 { font-size: 1.0em; font-weight: bold; margin-top: 0; margin-bottom: 5px; }
    .terms-page-container .term-item-pdf p { white-space: pre-line; margin-bottom: 0; font-size: 0.9em; }
    .terms-page-container .clear-floats { clear: both; }

    .custom-form-page { page-break-before: always !important; padding: 20px; font-family: Arial, sans-serif; font-size: 10px; color: #333; width: 8.5in !important; margin: 20px auto 0 auto; box-sizing: border-box; background-color: white !important; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .custom-form-page .page-main-title { text-align: center; font-weight: bold; margin-bottom: 15px; font-size: 1.3em; color: #4F8A10; border-bottom: 2px solid #4F8A10; padding-bottom: 5px; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .custom-form-page .form-section { margin-bottom: 15px; border: 1px solid #D3D3D3; border-radius: 5px; }
    .custom-form-page .form-section-title { font-size: 1.1em; font-weight: bold; color: white; background-color: #8FBC8F; padding: 8px; margin: 0; border-top-left-radius: 4px; border-top-right-radius: 4px; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .custom-form-page .section-content { padding: 10px; }
    .custom-form-page .form-question { margin-bottom: 8px; line-height: 1.4; }
    .custom-form-page .q-label { display: block; margin-bottom: 3px; }
    .custom-form-page .q-num { font-weight: bold; margin-right: 5px; }
    .custom-form-page .options { margin-left: 10px; font-style: italic; }
    .custom-form-page .details-line { margin-top: 2px; margin-left: 20px; }
    .custom-form-page .details-line .underline-fill { border-bottom: 1px dotted #555; min-width: 250px; display: inline-block; margin-left: 5px; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .custom-form-page .grid-inputs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 20px; margin-bottom: 10px; }
    .custom-form-page .grid-inputs .field-container, .custom-form-page .full-width-field .field-container { display: flex; flex-direction: column; }
    .custom-form-page .grid-inputs label, .custom-form-page .full-width-field label { font-weight: bold; margin-bottom: 2px; font-size: 0.9em; }
    .custom-form-page .grid-inputs .input-line, .custom-form-page .full-width-field .input-line { border-bottom: 1px dotted #555; height: 1.2em; width: 100%; -webkit-print-color-adjust: exact; color-adjust: exact; }
    .custom-form-page .checkbox-group label { font-weight: normal; margin-right: 15px; }

    @media print { body { background-color: white !important; padding: 0; margin: 0; -webkit-print-color-adjust: exact; color-adjust: exact; } #invoice-dialog-actions, .no-print { display: none !important; } @page { size: A4 portrait; margin: 0.5in; } }
`;

const InvoiceDialog = ({ open, onClose, data = {} }) => {
    const [showPrintPreview, setShowPrintPreview] = useState(false);
    const [printPreviewHTML, setPrintPreviewHTML] = useState('');

    const generateTermsHTML = () => {
        let termsHTML = `<div class="terms-page-container">`;
        termsHTML += `<h2>Rules and Regulations for Parents Visiting a Therapy Home</h2>`;
        termsData.forEach(term => {
            termsHTML += `<div class="term-item-pdf"><div class="english-col-pdf"><h3>${term.id}). ${term.title}</h3><p>${term.english}</p></div><div class="urdu-col-pdf"><h3>(${term.id})۔ ${translateTitle(term.title)}</h3><p>${term.urdu}</p></div><div class="clear-floats"></div></div>`;
        });
        termsHTML += `</div>`;
        return termsHTML;
    };

    const generateMedicalHistoryPageHTML = () => {
        let html = `<div class="custom-form-page medical-history-page">`;
        html += `<div class="page-main-title">Medical History</div>`;
        html += `<div class="form-section"><div class="form-section-title">Medical History</div><div class="section-content">`;
        html += `<div class="form-question"><span class="q-num">1.</span><span class="q-label">Did doctor have diagnosis any condition?</span> <span class="options">☐ Yes ☐ No</span></div><div class="details-line">If yes, please provide details: <span class="underline-fill"></span></div>`;
        html += `<div class="form-question"><span class="q-num">2.</span><span class="q-label">Have you taking any therapies before?</span> <span class="options">☐ Yes ☐ No</span></div><div class="details-line">If yes, please provide details: <span class="underline-fill"></span></div>`;
        html += `<div class="form-question"><span class="q-num">3.</span><span class="q-label">Is the child currently on any medication?</span> <span class="options">☐ Yes ☐ No</span></div><div class="details-line">If yes, please provide details: <span class="underline-fill"></span></div>`;
        html += `<div class="form-question"><span class="q-num">4.</span><span class="q-label">Which therapies are you seeking for?</span></div><div class="checkbox-group" style="margin-left:20px;"><label>☐ Speech Therapy</label><label>☐ Behavior Therapy</label><label>☐ Occupational Therapy</label><label>☐ Remedial Therapy</label></div><div class="details-line">Any specific: <span class="underline-fill" style="min-width:300px;"></span></div>`;
        html += `</div></div>`;
        html += `<div class="form-section"><div class="form-section-title">Other Information</div><div class="section-content">`;
        html += `<div class="form-question"><span class="q-num">1.</span><span class="q-label">Does the child attend the school?</span> <span class="options">☐ Yes ☐ No</span></div><div class="details-line">If yes, please provide details: <span class="underline-fill"></span></div>`;
        html += `</div></div>`;
        html += `<div class="form-section"><div class="form-section-title">Parents/Guardian Details</div><div class="section-content">`;
        html += `<div class="grid-inputs"><div class="field-container"><label>Full Name:</label><div class="input-line"></div></div><div class="field-container"><label>Contact:</label><div class="input-line"></div></div></div>`;
        html += `<div class="full-width-field field-container" style="margin-bottom:10px;"><label>Parents Profession:</label><div class="input-line"></div></div>`;
        html += `<div class="full-width-field field-container" style="margin-bottom:10px;"><label>Complete Address:</label><div class="input-line" style="height: 2.4em;"></div></div>`;
        html += `<div class="form-question"><span class="q-label">Reference:</span> <label>☐ Online <span class="underline-fill" style="min-width:100px;"></span></label>, <label>☐ Doctor name: <span class="underline-fill" style="min-width:100px;"></span></label>, <label>☐ Other: <span class="underline-fill" style="min-width:100px;"></span></label></div>`;
        html += `</div></div>`;
        html += `</div>`;
        return html;
    };

    const generateConsultantRecPageHTML = () => {
        let html = `<div class="custom-form-page consultant-rec-page">`;
        html += `<div class="page-main-title">Consultant Recommendation</div>`;
        const sections = [
            { title: "Speech Therapy", questions: ["Does the child have any difficulty pronouncing word?", "Is there any stuttering or fluency problem?", "Does the child follow and understand simple instruction?"]},
            { title: "Behavior Therapy", questions: ["Are the child have any behavior concern like TANTRUM, AGGRESSIVE, ANXIETY?", "Have the child diagnosis the AUTISM, ADHD, or any other development disorder?", "Are the child facing social interaction challenges?"]},
            { title: "Occupational Therapy", questions: ["Does the child have any difficulties with daily activities like dress, feeding, swallowing and motor coordination?", "Are the child have any sensory issue?"]},
            { title: "Remedial Therapy", questions: ["Are there any difficulties in learning, reading, writing & remembering?", "Is the child receiving any special education servies?"]}
        ];
        let qNum = 1;
        sections.forEach(section => {
            html += `<div class="form-section"><div class="form-section-title">${section.title}</div><div class="section-content">`;
            section.questions.forEach(question => {
                html += `<div class="form-question"><span class="q-num">${qNum++}.</span><span class="q-label">${question}</span> <span class="options">☐ Yes ☐ No</span></div>`;
            });
            html += `</div></div>`;
        });
        html += `<div class="form-section"><div class="form-section-title">Additional Program</div><div class="section-content checkbox-group"><label>☐ Inclusive Edification Program (I.E.P)</label> <label>☐ Fun & Learn (F&L)</label></div></div>`;
        html += `</div>`;
        return html;
    };

    const preparePrintPreviewHTML = () => {
        const invoiceElement = document.getElementById('invoice-dialog');
        if (!invoiceElement) {
            console.error("Invoice element not found for preview.");
            return "";
        }
        const invoiceContentHTML = invoiceElement.innerHTML;
        const medicalHistoryHTML = generateMedicalHistoryPageHTML(); // Page 2
        const consultantRecHTML = generateConsultantRecPageHTML();   // Page 3
        const termsContentHTML = generateTermsHTML();                 // Page 4

        return `
            <div id="printable-area-wrapper">
                <div id="invoice-content" class="invoice-dialog-print-view">
                    ${invoiceContentHTML}
                </div>
                ${medicalHistoryHTML}
                ${consultantRecHTML}
                ${termsContentHTML}
            </div>
        `;
    };

    const handleShowPrintPreview = () => {
        const combinedHTML = preparePrintPreviewHTML();
        if (combinedHTML) {
            setPrintPreviewHTML(combinedHTML);
            setShowPrintPreview(true);
        }
    };

    const handleActualPrintFromPreview = () => {
        if (!printPreviewHTML) {
            console.error("No content to print from preview.");
            return;
        }
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`<html><head><title>Print</title><style>${getPrintStyles()}</style></head><body>${printPreviewHTML}</body></html>`);
        printWindow.document.close();
        setTimeout(() => { printWindow.focus(); printWindow.print(); }, 500);
    };

    const handleDownload = () => {
        const combinedHTMLForPDF = preparePrintPreviewHTML();
        if (!combinedHTMLForPDF) {
             console.error("Could not prepare content for PDF download.");
            return;
        }
        const tempRenderDiv = document.createElement('div');
        tempRenderDiv.innerHTML = combinedHTMLForPDF;
        const opt = {
            margin: [0.5, 0.2, 0.5, 0.2],
            filename: `invoice_complete-${currentData.name || 'student'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: true,
                onclone: (documentCloned) => {
                    const allElements = documentCloned.querySelectorAll('*');
                    allElements.forEach(el => { el.style.webkitPrintColorAdjust = 'exact'; el.style.colorAdjust = 'exact'; });
                    const therapyHome = documentCloned.querySelector('#invoice-content .therapy-home');
                    if(therapyHome) therapyHome.style.color = '#ff9800 !important';
                }
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css', avoid: '.avoid-page-break', before: ['.terms-page-container', '.custom-form-page'] }
        };
        html2pdf().from(tempRenderDiv.firstChild).set(opt).save();
    };

    const currentData = {
        name: 'N/A', parentName: 'N/A', rollNum: 'N/A', consultancy: '0',
        admissionFee: '0', securityDeposit: '0', consultancyFeeAmount: '0',
        totalAmount: 0, therapyFee: 'N/A', iepFee: 'N/A',
        singleSessionFee: 'N/A', lateFee: 'N/A', forTheMonth: 'N/A',
        ...data
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen>
                <Box sx={{ p: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', overflowY: 'auto', bgcolor: 'grey.200' }}>
                    <DialogTitle sx={{ display: 'none' }}>Invoice</DialogTitle>
                    <DialogContent sx={{ padding: 0, width: 'auto', maxWidth: 'initial', overflow: 'visible' }}>
                        <div id="invoice-dialog" style={invoiceStyle}>
                            <header className="header" style={headerStyle}><div className="logo-container" style={logoContainerStyle}><img src={appIcon} alt="Logo" className="logo" style={logoStyle} /><div className="therapy-home" style={therapyHomeStyle}>THERAPY HOME</div></div><div className="slip-no" style={slipNoStyle}>SLIP NO. <span style={slipNoSpanStyle}>{('000' + Date.now().toString().slice(-3)).slice(-3)}</span></div></header>
                            <div className="info-section" style={infoSectionStyle}><div className="info-row" style={infoRowStyle}><div className="info-label" style={infoLabelStyle}>DATE:</div><div className="info-value" style={infoValueStyle}>{new Date().toLocaleDateString()}</div><div className="info-label" style={{ ...infoLabelStyle, marginLeft: '10px' }}>GR NO:</div><div className="info-value" style={infoValueStyle}>{currentData.rollNum}</div></div><div className="info-row" style={infoRowStyle}><div className="info-label" style={infoLabelStyle}>STUDENT NAME:</div><div className="info-value" style={infoValueStyle}>{currentData.name}</div><div className="info-label" style={{ ...infoLabelStyle, marginLeft: '10px' }}>FATHER NAME:</div><div className="info-value" style={infoValueStyle}>{currentData.parentName}</div></div><div className="info-row" style={infoRowStyle}><div className="fee-label" style={feeLabelStyle}>THERAPY FEE:</div><div className="fee-value" style={feeValueStyle}>{currentData.therapyFee}</div><div className="fee-label" style={{ ...feeLabelStyle, marginLeft: '10px' }}>I.E.P FEE:</div><div className="fee-value" style={feeValueStyle}>{currentData.iepFee}</div><div className="fee-label" style={{ ...feeLabelStyle, marginLeft: '10px' }}>CONSULTANCY FEE:</div><div className="fee-value" style={feeValueStyle}>{currentData.consultancy}</div></div><div className="info-row" style={infoRowStyle}><div className="fee-label" style={feeLabelStyle}>ADMISSION FEE:</div><div className="fee-value" style={feeValueStyle}>{currentData.admissionFee}</div><div className="fee-label" style={{ ...feeLabelStyle, marginLeft: '10px' }}>SINGLE SESSION FEE:</div><div className="fee-value" style={feeValueStyle}>{currentData.singleSessionFee}</div></div><div className="info-row" style={infoRowStyle}><div className="fee-label" style={feeLabelStyle}>Security Deposit FEE:</div><div className="fee-value" style={feeValueStyle}>{currentData.securityDeposit}</div><div className="fee-label" style={{ ...feeLabelStyle, marginLeft: '10px' }}>Consultancy Fee:</div><div className="fee-value" style={feeValueStyle}>{currentData.consultancyFeeAmount}</div><div className="balance-label" style={{ ...balanceLabelStyle, marginLeft: '10px' }}>BALANCE DUE:</div><div className="balance-value" style={balanceValueStyle}>{(parseFloat(currentData.totalAmount) || 0) - ((parseFloat(currentData.admissionFee) || 0) + (parseFloat(currentData.consultancy) || 0) + (parseFloat(currentData.therapyFee) || 0) + (parseFloat(currentData.iepFee) || 0) + (parseFloat(currentData.singleSessionFee) || 0) + (parseFloat(currentData.lateFee) || 0) + (parseFloat(currentData.securityDeposit) || 0) + (parseFloat(currentData.consultancyFeeAmount) || 0) )}</div></div></div>
                            <div className="stamp-signature" style={stampSignatureStyle}><div className="stamp-container" style={stampContainerStyle}>STAMP<div className="stamp" style={stampStyle}><img src={stampImage} alt="Stamp" style={stampImageStyle} /></div></div><div className="signature-container" style={signatureContainerStyle}>SIGNATURE<div className="signature-line" style={signatureLineStyle}></div></div></div>
                            <p className="note" style={noteStyle}><strong style={noteStrongStyle}>Note:</strong> All types of charges should be payable in advance. In case of not paying on time failure to adhere will be applied upon balance may result in Rs. 50/- no exchange request will be entertain in any case.</p><div className="website-info" style={websiteInfoStyle}>Website: <a href="http://www.therapyhome.com.pk" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>www.therapyhome.com.pk</a> | Email: <a href="mailto:therapyhome@gmail.com" style={websiteLinkStyle}>therapyhome@gmail.com</a> <br /> Facebook: <a href="https://www.facebook.com/Therapyhome/" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>Therapyhome</a> | Instagram: <a href="https://www.instagram.com/therapyhomeofficial/" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>Therapyhomeofficial</a></div>
                        </div>
                    </DialogContent>
                    <DialogActions id="invoice-dialog-actions" sx={{ pt: 2, justifyContent: 'center', width: '100%', maxWidth: '8.5in' }}>
                        <Button onClick={onClose} variant="outlined">Close</Button>
                        <Button onClick={handleShowPrintPreview} color="primary" variant="contained">Print</Button>
                        <Button onClick={handleDownload} color="secondary" variant="contained">Download Invoice</Button>
                    </DialogActions>
                </Box>
            </Dialog>

            <Dialog open={showPrintPreview} onClose={() => setShowPrintPreview(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { m: 2, width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' } }} >
                <DialogTitle>Print Preview <Button onClick={handleActualPrintFromPreview} color="primary" variant="contained" sx={{ position: 'absolute', right: 16, top: 12 }} className="no-print" > Print Now </Button> </DialogTitle>
                <DialogContent dividers sx={{padding: 0, '&::-webkit-scrollbar': {display: 'none'}, msOverflowStyle: 'none', scrollbarWidth: 'none'}}>
                    <style>{getPrintStyles()}</style>
                    <div id="print-preview-render-area" dangerouslySetInnerHTML={{ __html: printPreviewHTML }} style={{ zoom: 0.7, overflow: 'auto', height:'100%', display:'flex', flexDirection: 'column', alignItems:'center', padding: '20px', backgroundColor: '#e0e0e0' }} />
                </DialogContent>
                <DialogActions className="no-print"> <Button onClick={() => setShowPrintPreview(false)}>Close Preview</Button> </DialogActions>
            </Dialog>
        </>
    );
};

export default InvoiceDialog;