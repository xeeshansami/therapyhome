const babel = require('@babel/core');
const files = [
 'src/theme.js','src/index.js','src/ThemeModeProvider.js','src/context/ColorModeContext.js',
 'src/components/styles.js','src/components/SettingsLauncher.js',
 'src/pages/admin/AdminDashboard.js','src/pages/student/StudentDashboard.js','src/pages/teacher/TeacherDashboard.js',
 'src/pages/admin/AdminHomePage.js','src/pages/student/StudentHomePage.js','src/pages/teacher/TeacherHomePage.js'
];
let fail=0;
for (const f of files){
  try{ babel.transformFileSync(f,{presets:[['@babel/preset-react'],['@babel/preset-env',{targets:{node:'current'}}]]}); console.log('OK   '+f);}
  catch(e){ fail++; console.log('FAIL '+f+'\n   '+e.message.split('\n')[0]); }
}
process.exit(fail?1:0);
