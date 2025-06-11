import { Container, Typography, Box, Grid, Divider } from '@mui/material';

const TermsPage = () => {
  const terms = [
    {
      id: 'a',
      title: "Admission and Security Deposit",
      english: "The finalized Admission fees and security deposit must be submitted to confirm your child's enrollment or to confirm your therapy slotting.",
      urdu: "آپ کے بچے کے داخلے کی تصدیق یا آپ کی تھراپی کی سلاٹنگ کی تصدیق کے لیے حتمی داخلہ فیس اور سیکیورٹی ڈپازٹ جمع کروانا ضروری ہے۔"
    },
    {
      id: 'b',
      title: "Payment and Procedures",
      english: `Parents can submit fees through the following options:\n1. Cash Payment\n2. Online Transfer (Please share the online slip with us).\n\nBank: Meezan Bank\nTitle: THERAPY HOME\nAccount No: 0156-0109649823`,
      urdu: `والدین درج ذیل طریقوں سے فیس جمع کروا سکتے ہیں:\n1. نقد ادائیگی\n2. آن لائن ٹرانسفر (براہ کرم آن لائن سلپ ہمیں فراہم کریں)\n\nبینک: میزان بینک\nاکاؤنٹ ٹائٹل: تھراپی ہوم\nاکاؤنٹ نمبر: 0156-0109649823`
    },
    {
      id: 'c',
      title: "Mid-Month Admissions / Enrollment",
      english: "If the child begins therapy in the middle of the month, fees will be charged for the remaining days in that month. The fee for the subsequent month should be paid in full between the 1st to 7th of each month.",
      urdu: "اگر بچہ ماہ کے درمیان میں تھراپی شروع کرتا ہے، تو اس ماہ کے باقی دنوں کی فیس وصول کی جائے گی۔ آئندہ ماہ کی فیس مکمل طور پر ہر ماہ کی 1 تاریخ سے 7 تاریخ کے درمیان ادا کی جائے گی۔"
    },
    {
      id: 'd',
      title: "Delayed Payment",
      english: "All payments must be made between the 1st and 7th of each month. Any payments submitted after the 7th will incur a penalty. It is the responsibility of individuals to settle dues promptly to avoid additional charges.",
      urdu: "تمام ادائیگیاں ہر مہینے کے پہلے سے لے کر ساتویں تاریخ کے درمیان کی جانی چاہئیں۔ ساتویں تاریخ کے بعد جمع شدہ کوئی بھی ادائیگی جرمانہ کا حصہ بنے گی۔ افراد کا فرض ہے کہ واجبات کو بروقت ادا کریں تاکہ اضافی چارجز سے بچا جا سکے۔"
    },
    {
      id: 'e',
      title: "Session Leave and Re-Admission",
      english: "In the event of leaving the session for any reason or not continuing for a certain period, admission will be canceled, and rejoining the session will be subject to re-admission procedures.",
      urdu: "اگر کسی بھی وجہ سے آپ سیشن چھوڑ دیتے ہیں یا کسی مخصوص مدت کے لیے جاری نہیں رکھتے تو داخلہ منسوخ کر دیا جائے گا اور دوبارہ شمولیت دوبارہ داخلے کے طریقہ کار سے مشروط ہوگی۔"
    },
    {
      "id": "f",
      "title": "Fee Policy for Monthly Breaks",
      "urdu": "اگر والدین کسی بھی وجہ سے ایک مہینے کے لیے سیشنز سے وقفہ یا توقف اختیار کرنا چاہیں، تو درج ذیل فیس پالیسی لاگو ہوگی:\nآئی ای پی (IEP) یا فن اینڈ لرن پروگرام میں شامل والدین کو مہینے کی پوری پروگرام فیس ادا کرنی ہوگی۔\nانفرادی سیشنز (one-on-one sessions) لینے والے والدین کو ماہانہ فیس کا 50 فیصد ادا کرنا ہوگا۔\nوقت: براہ کرم طے شدہ سیشن یا مشاورتی ملاقاتوں کے لیے وقت پر پہنچیں اور تھراپسٹ کے شیڈول کا خیال رکھیں۔\nتلافی:\n۱۔ حاضری فائل: براہ کرم یقینی بنائیں کہ طالب علم کی حاضری، حاضری فائل میں درج کی گئی ہے، تب ہی ہم آپ کو تلافی سیشن فراہم کریں گے۔ اگر آپ حاضری درج نہیں کریں گے، تو ہم تلافی سیشن فراہم نہیں کر سکیں گے۔\n۲۔ غیر حاضری کی اطلاع: براہ کرم یقینی بنائیں کہ اگر آپ سیشن کے دن چھٹی کرنا چاہتے ہیں یا غیر حاضر رہنا چاہتے ہیں تو سیشن سے ۳۰ منٹ قبل مطلع کریں۔ تب ہی ہم آپ کو تلافی سیشن فراہم کریں گے۔ اگر آپ سیشن سے ۳۰ منٹ قبل مطلع نہیں کریں گے، تو ہم تلافی سیشن فراہم نہیں کر سکیں گے۔",
      "english": "If parents choose to take a break or pause sessions for one month for any reason, the following fee policy will apply:\nParents enrolled in the IEP or Fun & Learn program will be required to pay the full program fee for the month.\nParents utilizing one-on-one sessions will be required to pay 50% of the monthly fee.\nTime: Please arrive on time for session scheduled or consultancy appointments and be mindful of the therapist's schedule.\nCompensate:\n1. Attendance File: Please ensure to mark the student attendance in the attendance file, then we will provide you the compensate session if you don’t mark the attendance, we will not be able to provide compensate.\n2. Absent information: Please ensure to inform 30 mints before the session if you want to leave or absent on that session day. then we will provide you the compensate session if you don’t inform 30 mints before the session, we will not be able to provide compensate."
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Rules and Regulations for Parents Visiting a Therapy Home
      </Typography>

      {terms.map((term, index) => (
        <Box key={term.id} sx={{ my: 3, border: '1px solid #ccc', borderRadius: 2, p: 2 }}>
          <Grid container spacing={2}>
            {/* English on left */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">
                {`${term.id}). ${term.title}`}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {term.english}
              </Typography>
            </Grid>

            {/* Urdu on right */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" align="right" dir="rtl">
                {`(${term.id})۔ ${translateTitle(term.title)}`}
              </Typography>
              <Typography variant="body1" align="right" dir="rtl" sx={{ whiteSpace: 'pre-line' }}>
                {term.urdu}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

// Optional title translator (for semantic structure)
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

export default TermsPage;
