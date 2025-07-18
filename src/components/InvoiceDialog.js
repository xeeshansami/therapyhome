// components/InvoiceDialog.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';
import html2pdf from 'html2pdf.js';

// Replace with your actual imports
import stampImage from '../assets/stamp.png';
import signatureImg from '../assets/signofadmin.png';
import appIcon from '../assets/logo.png';

// Helper function to render a checkbox based on a boolean value
const renderCheckbox = (isChecked) => (isChecked ? '☑' : '☐');

// Data for the Terms Page (remains unchanged)
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
const overlappingSignatureStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '120px', height: 'auto', zIndex: 1 }; // New style for overlapping signature
// Meticulously Scoped Print Styles (remains unchanged)
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

    // Helper function to render a checkbox based on a boolean value
    const renderCheckbox = (isChecked) => (isChecked ? '☑' : '☐');

    const generateTermsHTML = () => {
        let termsHTML = `<div class="terms-page-container">`;
        termsHTML += `<h2>Rules and Regulations for Parents Visiting a Therapy Home</h2>`;
        termsData.forEach(term => {
            termsHTML += `<div class="term-item-pdf"><div class="english-col-pdf"><h3>${term.id}). ${term.title}</h3><p>${term.english}</p></div><div class="urdu-col-pdf"><h3>(${term.id})۔ ${translateTitle(term.title)}</h3><p>${term.urdu}</p></div><div class="clear-floats"></div></div>`;
        });
        termsHTML += `</div>`;
        return termsHTML;
    };

    // Initialize currentData with defaults, then merge props.data
    // This ensures all expected fields are present, preventing errors.
    const currentData = {
        // --- Basic Info from original invoice data ---
        name: 'N/A', parentsName: 'N/A', rollNum: 'N/A',
        invoiceID: 'N/A', // Assuming this comes with main student data or fee record
        isConsultancyOrIsRegistrationOrMonthly: 'N/A', // Used in main invoice fee display
        isConsultantStudent: false, // Used in main invoice fee display

        // Fee amounts for main invoice display
        admissionFee: 0,
        securityDeposit: 0,
        netTotalFee: 0, // This is the 'totalFee' from the fee record or monthly fee
        paidFee: 0, // This is the 'paidFee' from the fee record
        therapyPlan: {}, // Empty object for therapyPlan defaults if not provided

        // --- Medical History Section ---
        doctorDiagnosisCondition: false, // Boolean
        doctorDiagnosisDetails: '',
        takingTherapiesBefore: false, // Boolean
        therapiesBeforeDetails: '',
        onMedication: false, // Boolean
        medicationDetails: '',
        therapiesSeeking: [], // Array of strings e.g., ['Speech Therapy', 'Behavior Therapy']
        therapiesSeekingSpecific: '', // "Any specific" text
        childAttendsSchool: false, // Boolean
        schoolDetails: '',
        // Parent details for Medical History section (using existing schema fields)
        parentDetails_fullName: '', // Map to currentData.parentsName or currentData.parentsName
        parentDetails_contact: '',  // Map to currentData.parentsContact
        parentDetails_profession: '', // Map to currentData.parentProfession
        parentDetails_address: '',    // Map to currentData.address or currentData.parentAddress

        // --- Reference (nested object as per schema) ---
        reference: {
            online: false,
            online_details: '',
            doctorName: false,
            doctorName_details: '',
            other: false,
            other_details: '',
        },

        // --- Consultant Recommendation Section ---
        rec_speech_difficultyPronouncing: false,
        rec_speech_stuttering: false,
        rec_speech_followInstructions: false,
        rec_behavior_concern: false,
        rec_behavior_diagnosis: false, // For AUTISM, ADHD, etc.
        rec_behavior_socialChallenges: false,
        rec_occupational_dailyActivities: false,
        rec_occupational_sensoryIssue: false,
        rec_remedial_difficultiesLearning: false,
        rec_remedial_specialEducation: false,
        rec_additional_iep: false, // For Inclusive Edification Program
        rec_additional_fl: false,  // For Fun & Learn

        // Merge actual data on top of defaults
        ...data
    };

    // Helper for safe access to therapyPlan properties
    const getTherapyPlanValue = (key) => {
        try {
            // Attempt to parse therapyPlan if it's a string, otherwise use directly
            const plan = typeof currentData.therapyPlan === 'string'
                ? JSON.parse(currentData.therapyPlan || '{}')
                : currentData.therapyPlan || {};
            return plan[key] || 0; // Return value or 0 if not found
        } catch (e) {
            console.error("Error parsing therapyPlan:", e);
            return 0;
        }
    };


    const generateMedicalHistoryPageHTML = () => {
        let html = `<div class="custom-form-page medical-history-page">`;
        html += `<div class="page-main-title">Medical History</div>`;
        html += `<div class="form-section"><div class="form-section-title">Medical History</div><div class="section-content">`;

        // Question 1: Did doctor have diagnosis any condition?
        html += `<div class="form-question">
                    <span class="q-num">1.</span>
                    <span class="q-label">Did doctor have diagnosis any condition?</span>
                    <span class="options">
                        ${renderCheckbox(currentData.doctorDiagnosisCondition)} Yes
                        ${renderCheckbox(!currentData.doctorDiagnosisCondition)} No
                    </span>
                 </div>
                 <div class="details-line">If yes, please provide details: <span class="underline-fill">${currentData.doctorDiagnosisDetails || ''}</span></div>`;

        // Question 2: Have you taking any therapies before?
        html += `<div class="form-question">
                    <span class="q-num">2.</span>
                    <span class="q-label">Have you taking any therapies before?</span>
                    <span class="options">
                        ${renderCheckbox(currentData.takingTherapiesBefore)} Yes
                        ${renderCheckbox(!currentData.takingTherapiesBefore)} No
                    </span>
                 </div>
                 <div class="details-line">If yes, please provide details: <span class="underline-fill">${currentData.therapiesBeforeDetails || ''}</span></div>`;

        // Question 3: Is the child currently on any medication?
        html += `<div class="form-question">
                    <span class="q-num">3.</span>
                    <span class="q-label">Is the child currently on any medication?</span>
                    <span class="options">
                        ${renderCheckbox(currentData.onMedication)} Yes
                        ${renderCheckbox(!currentData.onMedication)} No
                    </span>
                 </div>
                 <div class="details-line">If yes, please provide details: <span class="underline-fill">${currentData.medicationDetails || ''}</span></div>`;

        // Question 4: Which therapies are you seeking for?
        html += `<div class="form-question"><span class="q-num">4.</span><span class="q-label">Which therapies are you seeking for?</span></div>
                 <div class="checkbox-group" style="margin-left:20px;">
                     <label>${renderCheckbox(currentData.therapiesSeeking.includes('Speech Therapy'))} Speech Therapy</label>
                     <label>${renderCheckbox(currentData.therapiesSeeking.includes('Behavior Therapy'))} Behavior Therapy</label>
                     <label>${renderCheckbox(currentData.therapiesSeeking.includes('Occupational Therapy'))} Occupational Therapy</label>
                     <label>${renderCheckbox(currentData.therapiesSeeking.includes('Remedial Therapy'))} Remedial Therapy</label>
                 </div>
                 <div class="details-line">Any specific: <span class="underline-fill" style="min-width:300px;">${currentData.therapiesSeekingSpecific || ''}</span></div>`;
        html += `</div></div>`; // End Medical History form section

        html += `<div class="form-section"><div class="form-section-title">Other Information</div><div class="section-content">`;
        // Other Information Question 1: Does the child attend the school?
        html += `<div class="form-question">
                    <span class="q-num">1.</span>
                    <span class="q-label">Does the child attend the school?</span>
                    <span class="options">
                        ${renderCheckbox(currentData.childAttendsSchool)} Yes
                        ${renderCheckbox(!currentData.childAttendsSchool)} No
                    </span>
                 </div>
                 <div class="details-line">If yes, please provide details: <span class="underline-fill">${currentData.schoolDetails || ''}</span></div>`;
        html += `</div></div>`; // End Other Information section

        html += `<div class="form-section"><div class="form-section-title">Parents/Guardian Details</div><div class="section-content">`;
        html += `<div class="grid-inputs">
                    <div class="field-container"><label>Full Name:</label><div class="input-line">${currentData.parentsName || currentData.parentsName || ''}</div></div>
                    <div class="field-container"><label>Contact:</label><div class="input-line">${currentData.parentsContact || ''}</div></div>
                 </div>`;
        html += `<div class="full-width-field field-container" style="margin-bottom:10px;"><label>Parents Profession:</label><div class="input-line">${currentData.parentProfession || ''}</div></div>`;
        html += `<div class="full-width-field field-container" style="margin-bottom:10px;"><label>Complete Address:</label><div class="input-line" style="height: 2.4em;"><p style="margin:0; white-space: pre-line;">${currentData.address || currentData.parentAddress || ''}</p></div></div>`;
        html += `<div class="form-question">
                    <span class="q-label">Reference:</span>
                    <label>
                        <span class="underline-fill" style="min-width:100px;">${currentData.reference}</span>
                    </label>,
                 </div>`;
        html += `</div></div>`; // End Parents/Guardian Details section
        html += `</div>`; // End custom-form-page
        return html;
    };

    const generateConsultantRecPageHTML = () => {
        let html = `<div class="custom-form-page consultant-rec-page">`;
        html += `<div class="page-main-title">Consultant Recommendation</div>`;
        let qNum = 1; // Question numbering for display

        const sections = [
            {
                title: "Speech Therapy",
                questions: [
                    { label: "Does the child have any difficulty pronouncing word?", dataKey: "rec_speech_difficultyPronouncing" },
                    { label: "Is there any stuttering or fluency problem?", dataKey: "rec_speech_stuttering" },
                    { label: "Does the child follow and understand simple instruction?", dataKey: "rec_speech_followInstructions" }
                ]
            },
            {
                title: "Behavior Therapy",
                questions: [
                    { label: "Are the child have any behavior concern like TANTRUM, AGGRESSIVE, ANXIETY?", dataKey: "rec_behavior_concern" },
                    { label: "Have the child diagnosis the AUTISM, ADHD, or any other development disorder?", dataKey: "rec_behavior_diagnosis" },
                    { label: "Are the child facing social interaction challenges?", dataKey: "rec_behavior_socialChallenges" }
                ]
            },
            {
                title: "Occupational Therapy",
                questions: [
                    { label: "Does the child have any difficulties with daily activities like dress, feeding, swallowing and motor coordination?", dataKey: "rec_occupational_dailyActivities" },
                    { label: "Are the child have any sensory issue?", dataKey: "rec_occupational_sensoryIssue" }
                ]
            },
            {
                title: "Remedial Therapy",
                questions: [
                    { label: "Are there any difficulties in learning, reading, writing & remembering?", dataKey: "rec_remedial_difficultiesLearning" },
                    { label: "Is the child receiving any special education servies?", dataKey: "rec_remedial_specialEducation" }
                ]
            }
        ];

        sections.forEach(section => {
            html += `<div class="form-section"><div class="form-section-title">${section.title}</div><div class="section-content">`;
            section.questions.forEach(question => {
                const isYes = currentData[question.dataKey]; // Assuming these are already boolean from schema
                html += `<div class="form-question">
                            <span class="q-num">${qNum++}.</span>
                            <span class="q-label">${question.label}</span>
                            <span class="options">
                                ${renderCheckbox(isYes)} Yes
                                ${renderCheckbox(!isYes)} No
                            </span>
                         </div>`;
            });
            html += `</div></div>`;
        });

        html += `<div class="form-section"><div class="form-section-title">Additional Program</div>
                    <div class="section-content checkbox-group">
                        <label>${renderCheckbox(currentData.rec_additional_iep)} Inclusive Edification Program (I.E.P)</label>
                        <label>${renderCheckbox(currentData.rec_additional_fl)} Fun & Learn (F&L)</label>
                    </div>
                 </div>`;
        html += `</div>`;
        return html;
    };

    const preparePrintPreviewHTML = () => {
        const invoiceElement = document.getElementById('invoice-dialog');
        if (!invoiceElement) {
            console.error("Invoice element not found for preview.");
            return "";
        }
        // Clone the invoice content and set class for print view to ensure specific print styles
        const invoiceContentClone = invoiceElement.cloneNode(true);
        invoiceContentClone.id = "invoice-content"; // Give it a consistent ID for print styles
        invoiceContentClone.classList.add('invoice-dialog-print-view'); // Add class for print styles

        const medicalHistoryHTML = generateMedicalHistoryPageHTML(); // Page 2
        const consultantRecHTML = generateConsultantRecPageHTML();   // Page 3
        const termsContentHTML = generateTermsHTML();                // Page 4

        return `
            <div id="printable-area-wrapper">
                ${invoiceContentClone.outerHTML}
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
        // Give browser a moment to render before printing
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
            html2canvas: {
                scale: 2, useCORS: true, logging: true,
                onclone: (documentCloned) => {
                    const allElements = documentCloned.querySelectorAll('*');
                    allElements.forEach(el => { el.style.webkitPrintColorAdjust = 'exact'; el.style.colorAdjust = 'exact'; });
                    const therapyHome = documentCloned.querySelector('#invoice-content .therapy-home');
                    if (therapyHome) therapyHome.style.color = '#ff9800 !important'; // Ensure brand color is printed
                    const noteStrong = documentCloned.querySelector('#invoice-content .note strong');
                    if (noteStrong) noteStrong.style.color = 'red !important'; // Ensure note strong is red
                    const websiteInfo = documentCloned.querySelector('#invoice-content .website-info');
                    if (websiteInfo) websiteInfo.style.color = '#777 !important'; // Ensure website info is grey
                    const websiteLinks = documentCloned.querySelectorAll('#invoice-content .website-info a');
                    websiteLinks.forEach(a => { a.style.color = '#007bff !important'; }); // Ensure links are blue
                }
            },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: 'css', avoid: '.avoid-page-break', before: ['.terms-page-container', '.custom-form-page'] }
        };
        html2pdf().from(tempRenderDiv.firstChild).set(opt).save();
    };


    return (
        <>
            <Dialog open={open} onClose={onClose} fullScreen>
                <Box sx={{ p: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', overflowY: 'auto', bgcolor: 'grey.200' }}>
                    <DialogTitle sx={{ display: 'none' }}>Invoice</DialogTitle>
                    <DialogContent sx={{ padding: 0, width: 'auto', maxWidth: 'initial', overflow: 'visible' }}>
                        <div id="invoice-dialog" style={invoiceStyle}>
                            <header className="header" style={headerStyle}>
                                <div className="logo-container" style={logoContainerStyle}>
                                    <img src={appIcon} alt="Logo" className="logo" style={logoStyle} />
                                    <div className="therapy-home" style={therapyHomeStyle}>THERAPY HOME</div>
                                </div>
                                <div className="slip-no" style={slipNoStyle}>INVOICE# <span style={slipNoSpanStyle}>{currentData.invoiceID}</span></div>
                            </header>

                            <div className="info-section" style={infoSectionStyle}>
                                <div className="info-row" style={infoRowStyle}>
                                    <div className="info-label" style={infoLabelStyle}>DATE:</div>
                                    <div className="info-value" style={infoValueStyle}>{new Date().toLocaleDateString()}</div>
                                    <div className="info-label" style={{ ...infoLabelStyle, marginLeft: '10px' }}>GR NO:</div>
                                    <div className="info-value" style={infoValueStyle}>{currentData.rollNum}</div>
                                </div>
                                <div className="info-row" style={infoRowStyle}>
                                    <div className="info-label" style={infoLabelStyle}>STUDENT NAME:</div>
                                    <div className="info-value" style={infoValueStyle}>{currentData.name}</div>
                                    <div className="info-label" style={{ ...infoLabelStyle, marginLeft: '10px' }}>PARENT'S NAME:</div>
                                    <div className="info-value" style={infoValueStyle}>{currentData.parentsName}</div>
                                </div>
                                <div className="info-row" style={infoRowStyle}>
                                    <div className="fee-label" style={{ ...feeLabelStyle, }}>Monthly Fee's:</div>
                                    <div className="fee-value" style={feeValueStyle}>
                                        {currentData.isConsultancyOrIsRegistrationOrMonthly === '2' ? JSON.parse(currentData?.therapyPlan || '{}').perMonthCost || 0 : 'N/A'}
                                    </div>
                                </div>
                                <div className="info-row" style={infoRowStyle}>
                                    <div className="fee-label" style={feeLabelStyle}>Admission Fee's:</div>
                                    <div className="fee-value" style={feeValueStyle}>
                                        {currentData.isConsultancyOrIsRegistrationOrMonthly === '1' ? currentData.admissionFee : 'N/A'}
                                    </div>
                                    <div className="fee-label" style={{ ...feeLabelStyle, marginLeft: '10px' }}>Per Session:</div>
                                    <div className="fee-value" style={feeValueStyle}>
                                        {currentData.isConsultancyOrIsRegistrationOrMonthly === '2' ? JSON.parse(currentData?.therapyPlan || '{}').perSessionCost || 0 : 'N/A'}
                                    </div>
                                </div>
                                <div className="info-row" style={infoRowStyle}>
                                    <div className="fee-label" style={feeLabelStyle}>Security Deposit:</div>
                                    <div className="fee-value" style={feeValueStyle}>
                                        {currentData.isConsultancyOrIsRegistrationOrMonthly === '1' ? currentData.securityDeposit : 'N/A'}
                                    </div>
                                    <div className="fee-label" style={{ ...feeLabelStyle, marginLeft: '10px' }}>Consultancy Fee's:</div>
                                    <div className="fee-value" style={feeValueStyle}>
                                        {(currentData.isConsultantStudent && currentData.isConsultancyOrIsRegistrationOrMonthly === '0') ? currentData.netTotalFee : 'N/A'}
                                    </div>
                                </div>

                                {/* NEW ROW FOR PAID AMOUNT AND BALANCE DUE */}
                                <div className="info-row" style={infoRowStyle}>
                                    <div className="fee-label" style={feeLabelStyle}>Paid Amount:</div>
                                    <div className="fee-value" style={{ ...feeValueStyle, color: 'green', fontWeight: 'bold' }}>
                                        {currentData.paidFee || 0} {/* Green Highlight */}
                                    </div>
                                    <div className="balance-label" style={{ ...balanceLabelStyle, marginLeft: '10px' }}>Balance Due:</div>
                                    <div className="balance-value" style={{ ...balanceValueStyle, color: 'red', fontWeight: 'bold' }}>
                                        {(parseFloat(currentData.netTotalFee) || 0) - (parseFloat(currentData.paidFee) || 0)} {/* Red Highlight */}
                                    </div>
                                </div>

                            </div> {/* End of info-section */}


                            <div className="stamp-signature" style={{ display: 'flex', gap: '100px', alignItems: 'flex-end' }}>
                                {/* STAMP + SIGNATURE OVERLAP */}
                                <div className="stamp-container" style={{ textAlign: 'center', position: 'relative', marginTop: '0' }}>
                                    <div style={{ position: 'relative', width: '180px', height: '180px' }}>

                                        {/* Stamp Image (40% size, centered) */}
                                        <img
                                            src={stampImage}
                                            alt="Stamp"
                                            style={{
                                                width: '40%',
                                                height: '40%',
                                                borderRadius: '50%',
                                                objectFit: 'contain',
                                                position: 'absolute',
                                                top: '30%', // centers vertically ( (100% - 40%) / 2 )
                                                left: '30%', // centers horizontally
                                                zIndex: 1
                                            }}
                                        />

                                        {/* Signature Image (Full size, overlapping) */}
                                        <img
                                            src={signatureImg}
                                            alt="Signature"
                                            style={{
                                                width: '80%',
                                                height: '80%',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                transform: 'rotate(-10deg)',
                                                opacity: 0.9,
                                                zIndex: 2,
                                                objectFit: 'contain',
                                                pointerEvents: 'none'
                                            }}
                                        />
                                    </div>
                                </div>


                                <div
                                    className="stamp-signature"
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginTop: '40px',
                                        alignItems: 'flex-end',
                                    }}
                                >
                                    {/* LEFT BLOCK - optional (STAMP or other content) */}
                                    <div style={{ width: '200px' }}>
                                        {/* You can leave this empty or add the stamp block here */}
                                    </div>

                                    {/* RIGHT BLOCK - Signature Line */}
                                    <div
                                        className="signature-container"
                                        style={{
                                            textAlign: 'center',
                                            position: 'relative',
                                            width: '250px',
                                        }}
                                    >
                                        <div style={{ position: 'relative', height: '60px' }}>
                                            {/* Line */}
                                            <div
                                                style={{
                                                    borderBottom: '2px solid #000',
                                                    width: '100%',
                                                    position: 'absolute',
                                                    bottom: '0',
                                                    left: '0',
                                                }}
                                            />
                                            {/* Signature over the line */}
                                            <img
                                                src={signatureImg}
                                                alt="Signature on line"
                                                style={{
                                                    position: 'center',
                                                    bottom: '5px',
                                                    left: '0',
                                                    height: '65px',
                                                    objectFit: 'contain',
                                                }}
                                            />
                                        </div>

                                        {/* Optional label under the line */}
                                        <div style={{ marginTop: '2px', fontSize: '8px' }}>
                                            Admin Signature
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <p className="note" style={noteStyle}>
                                <strong style={noteStrongStyle}>Note:</strong> All types of charges should be payable in advance. In case of not paying on time failure to adhere will be applied upon balance may result in Rs. 50/- no exchange request will be entertain in any case.
                            </p>
                            <div className="website-info" style={websiteInfoStyle}>
                                Website: <a href="http://www.therapyhome.com.pk" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>www.therapyhome.com.pk</a> | Email: <a href="mailto:therapyhome@gmail.com" style={websiteLinkStyle}>therapyhome@gmail.com</a> <br />
                                Facebook: <a href="https://www.facebook.com/Therapyhome/" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>Therapyhome</a> | Instagram: <a href="https://www.instagram.com/therapyhomeofficial/" target="_blank" rel="noopener noreferrer" style={websiteLinkStyle}>Therapyhomeofficial</a>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions id="invoice-dialog-actions" sx={{ pt: 2, justifyContent: 'center', width: '100%', maxWidth: '8.5in' }}>
                        <Button onClick={onClose} variant="outlined">Close</Button>
                        <Button onClick={handleShowPrintPreview} color="primary" variant="contained">Print</Button>
                        {/* <Button onClick={handleDownload} color="secondary" variant="contained">Download Invoice</Button> */}
                    </DialogActions>
                </Box>
            </Dialog>
            <Dialog open={showPrintPreview} onClose={() => setShowPrintPreview(false)} fullWidth maxWidth="lg" PaperProps={{ sx: { m: 2, width: 'calc(100% - 32px)', height: 'calc(100% - 32px)' } }} >
                <DialogTitle>Print Preview <Button onClick={handleActualPrintFromPreview} color="primary" variant="contained" sx={{ position: 'absolute', right: 16, top: 12 }} className="no-print" > Print Now </Button> </DialogTitle>
                <DialogContent dividers sx={{ padding: 0, '&::-webkit-scrollbar': { display: 'none' }, msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    <style>{getPrintStyles()}</style>
                    <div id="print-preview-render-area" dangerouslySetInnerHTML={{ __html: printPreviewHTML }} style={{ zoom: 0.7, overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#e0e0e0' }} />
                </DialogContent>
                <DialogActions className="no-print"> <Button onClick={() => setShowPrintPreview(false)}>Close Preview</Button> </DialogActions>
            </Dialog>
        </>
    );
};

export default InvoiceDialog;