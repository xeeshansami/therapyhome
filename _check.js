const babel = require('@babel/core');
const fs = require('fs');
const files = [
 'src/theme.js','src/index.js','src/components/styles.js','src/components/buttonStyles.js',
 'src/pages/admin/SideBar.js','src/pages/student/StudentSideBar.js','src/pages/teacher/TeacherSideBar.js',
 'src/pages/admin/AdminHomePage.js','src/pages/student/StudentHomePage.js','src/pages/teacher/TeacherHomePage.js',
 'src/pages/LoginPage.js','src/pages/ChooseUser.js','src/pages/Homepage.js'
];
let fail=0;
for (const f of files){
  try{
    babel.transformFileSync(f,{presets:[['@babel/preset-react'],['@babel/preset-env',{targets:{node:'current'}}]]});
    console.log('OK   '+f);
  }catch(e){ fail++; console.log('FAIL '+f+'\n   '+e.message.split('\n')[0]); }
}
process.exit(fail?1:0);
