export const SEED_STDS = [
  "1-A (Boys)", "1-A (Girls)", "1-B (Boys)", "1-B (Girls)", 
  "2-A (Boys)", "2-A (Girls)", "2-B (Boys)", "2-B (Girls)", 
  "3-A (Boys)", "3-A (Girls)", "3-B (Boys)", "3-B (Girls)", "3-C (Girls)", 
  "4-A (Boys)", "4-A (Girls)", "4-B (Boys)", "4-B (Girls)", "4-C (Girls)", 
  "5-A (Boys)", "5-A (Girls)", "5-B (Boys)", "5-B (Girls)", 
  "6-A (Boys)", "6-A (Girls)", "6-B (Boys)", 
  "7-A (Boys)", "7-A (Girls)"
];

const PRIMARY_SUBJECTS = ["Maths", "Science", "Physics", "Chemistry", "Biology", "History", "Geography"];
const HIGHER_SUBJECTS = ["Sociology", "Economics", "Business Studies"];

export const SEED_SUBJECTS = {
  "1-A (Boys)": [...PRIMARY_SUBJECTS],
  "1-A (Girls)": [...PRIMARY_SUBJECTS],
  "1-B (Boys)": [...PRIMARY_SUBJECTS],
  "1-B (Girls)": [...PRIMARY_SUBJECTS],
  "2-A (Boys)": [...PRIMARY_SUBJECTS],
  "2-A (Girls)": [...PRIMARY_SUBJECTS],
  "2-B (Boys)": [...PRIMARY_SUBJECTS],
  "2-B (Girls)": [...PRIMARY_SUBJECTS],
  "3-A (Boys)": [...PRIMARY_SUBJECTS],
  "3-A (Girls)": [...PRIMARY_SUBJECTS],
  "3-B (Boys)": [...PRIMARY_SUBJECTS],
  "3-B (Girls)": [...PRIMARY_SUBJECTS],
  "3-C (Girls)": [...PRIMARY_SUBJECTS],
  "4-A (Boys)": [...PRIMARY_SUBJECTS],
  "4-A (Girls)": [...PRIMARY_SUBJECTS],
  "4-B (Boys)": [...PRIMARY_SUBJECTS],
  "4-B (Girls)": [...PRIMARY_SUBJECTS],
  "4-C (Girls)": [...PRIMARY_SUBJECTS],
  "5-A (Boys)": [...HIGHER_SUBJECTS],
  "5-A (Girls)": [...HIGHER_SUBJECTS],
  "5-B (Boys)": [...HIGHER_SUBJECTS],
  "5-B (Girls)": [...HIGHER_SUBJECTS],
  "6-A (Boys)": [...HIGHER_SUBJECTS],
  "6-A (Girls)": [...HIGHER_SUBJECTS],
  "6-B (Boys)": [...HIGHER_SUBJECTS],
  "7-A (Boys)": [...HIGHER_SUBJECTS],
  "7-A (Girls)": [...HIGHER_SUBJECTS]
};

export const DEFAULT_DEMO_TEACHERS = [
  {
    id: 'admin',
    email: 'admin@msb.edu',
    name: 'School Admin',
    role: 'admin',
    assignments: [] // Admin sees all
  },
  {
    id: 'teacher_priya',
    email: 'priya.sharma@msb.edu',
    name: 'Priya Sharma',
    role: 'teacher',
    assignments: [
      '5-A (Boys)|Economics',
      '5-A (Girls)|Economics',
      '7-A (Girls)|Economics',
      '7-A (Boys)|Business Studies'
    ]
  },
  {
    id: 'teacher_mufaddal',
    email: 'mufaddal.kapadia@msb.edu',
    name: 'Mufaddal Kapadia',
    role: 'teacher',
    assignments: [
      '1-A (Boys)|Maths',
      '1-A (Girls)|Maths',
      '2-A (Boys)|Maths'
    ]
  }
];

export const SEED_STUDENTS = {
  "1-A (Boys)": [
    { id: "st_28903", name: "Idris bhai Abdulqadir bhai Kapadiya", roll: 28903 },
    { id: "st_28907", name: "Ammar bhai Shaikh Fakhruddin bhai Nagarwala", roll: 28907 },
    { id: "st_28910", name: "Shabbir bhai Shaikh Abdullah bhai Imadi", roll: 28910 },
    { id: "st_28920", name: "Mufaddal bhai Husain bhai Bootwala", roll: 28920 },
    { id: "st_28938", name: "Burhanuddin bhai Shaikh Husain bhai Merchant", roll: 28938 },
    { id: "st_28952", name: "Burhanuddin bhai Murtaza bhai Vardhawala", roll: 28952 },
    { id: "st_28965", name: "Mohammed bhai Shaikh Mufaddal bhai Shakir", roll: 28965 },
    { id: "st_28988", name: "Mukarram bhai Qusai bhai Blue", roll: 28988 },
    { id: "st_29004", name: "Burhanuddin bh Huzaifa bh Vaziri", roll: 29004 },
    { id: "st_29031", name: "Burhanuddin bhai Shaikh Yusuf bhai Shajapurwala", roll: 29031 },
    { id: "st_29040", name: "Husain bhai Abdulqadir bhai Dudhiyawala", roll: 29040 },
    { id: "st_29067", name: "Burhanuddin bhai Shaikh Mustafa bhai Cheap Jack (Kachwala)", roll: 29067 },
    { id: "st_29079", name: "Zohair bhai Mufaddal bhai Dudhiawala", roll: 29079 },
    { id: "st_29127", name: "Aliasgar bhai Ishaq bhai Matiwala", roll: 29127 },
    { id: "st_29154", name: "Abduttayyeb bs Miqdad bs Burhanee", roll: 29154 },
    { id: "st_29171", name: "Husain bhai Mustafa bhai Topiwala", roll: 29171 },
    { id: "st_29390", name: "Qusai bhai Fakhruddin bhai Dhundhiyawala", roll: 29390 },
    { id: "st_29391", name: "Taha bhai Moiz bhai Sopara", roll: 29391 },
    { id: "st_29392", name: "Burhanuddin bhai Abdulqadir bhai Hakimi", roll: 29392 },
    { id: "st_29393", name: "Ibrahim bhai Huzefa bhai Delmalwala", roll: 29393 },
    { id: "st_29415", name: "Murtaza bhai Aliasgar bhai Kadwalwala", roll: 29415 }
  ],
  "1-A (Girls)": [
    { id: "st_28918", name: "Batul bai Mustafa bhai Bohari", roll: 28918 },
    { id: "st_28935", name: "Batul bai Murtaza bhai Baji", roll: 28935 },
    { id: "st_28949", name: "Amatullah bai Mulla Huzaifa bhai Hakimi", roll: 28949 },
    { id: "st_28961", name: "Insiya bai Shaikh Murtaza bhai Ghadiali", roll: 28961 },
    { id: "st_28978", name: "Batool bai Fakhruddin bhai Jamali", roll: 28978 },
    { id: "st_28980", name: "Umme Salama bai Mustafa bhai Chokhawala", roll: 28980 },
    { id: "st_29026", name: "Nafisa bai Aliasgar bhai Tinwala", roll: 29026 },
    { id: "st_29039", name: "Ruqaiyah bai Taher bhai Badshah", roll: 29039 },
    { id: "st_29045", name: "Zahra bai Shaikh Murtaza bhai Nadir", roll: 29045 },
    { id: "st_29059", name: "Fatema bai Mulla Murtaza bhai Rangwala", roll: 29059 },
    { id: "st_29131", name: "Zainab bai Husain bhai Teen wala", roll: 29131 },
    { id: "st_29132", name: "Batul bai Moiz bhai Vora", roll: 29132 },
    { id: "st_29133", name: "Zainab bai Mustafahusain bhai Bohra", roll: 29133 },
    { id: "st_29389", name: "Insiyah bai Yusuf bhai Alirajpurwala", roll: 29389 },
    { id: "st_29394", name: "Amatullah bai Shaikh Adnan bhai Aamir", roll: 29394 },
    { id: "st_29396", name: "Aarefa bai Mufaddal bhai Saifee", roll: 29396 },
    { id: "st_29403", name: "Arwa bai Mufaddal bhai Tankiwala", roll: 29403 }
  ],
  "5-A (Boys)": [
    { id: "st_27319", name: "Mufaddal bhai Juzer bhai Bharmal", roll: 27319 },
    { id: "st_27361", name: "Abdemanaf bhai Shaikh Aliakbar bhai Attar", roll: 27361 },
    { id: "st_27370", name: "Taher bhai Mulla Zohair bhai Qamari", roll: 27370 },
    { id: "st_27383", name: "Shabbir bhai Husain bhai Saifee", roll: 27383 },
    { id: "st_27390", name: "Raj bhai Murtaza bhai Merchant", roll: 27390 },
    { id: "st_27427", name: "Hatim bhai Murtaza bhai Hirani", roll: 27427 },
    { id: "st_27431", name: "Mustansir bhai Mohammed bhai Baroodwala", roll: 27431 },
    { id: "st_27433", name: "Aliasgar bhai Huzaifa bhai Bumwala", roll: 27433 },
    { id: "st_27471", name: "Adnan bhai Hakim bhai Nampurwala", roll: 27471 },
    { id: "st_27505", name: "Husain bhai Qutbuddin bhai Adib", roll: 27505 }
  ],
  "5-A (Girls)": [
    { id: "st_27367", name: "Sarrah bai Mulla Mufaddal bhai Madda", roll: 27367 },
    { id: "st_27385", name: "Fatema bai Mohammed bhai Qutbi", roll: 27385 },
    { id: "st_27394", name: "Ummehani bai Shaikh Shabbir bhai Dohadwala", roll: 27394 },
    { id: "st_27400", name: "Mariyah bai Shaikh Abbas bhai Dhandhukawala", roll: 27400 },
    { id: "st_27418", "name": "Hawra bai Husain bhai Mundwada Wala", roll: 27418 }
  ],
  "7-A (Girls)": [
    { id: "st_27042", name: "Zahabiyah bai Murtaza bhai Begwala", roll: 27042 },
    { id: "st_27051", name: "Amatullah bai Murtaza bhai Kapasi", roll: 27051 },
    { id: "st_27055", name: "Insiyah bai Mulla Shabbir bhai Semari Wala", roll: 27055 },
    { id: "st_27056", "name": "Zainab bai Mulla Murtaza bhai Rampurawala", roll: 27056 }
  ],
  "7-A (Boys)": [
    { id: "st_26698", name: "Mulla Hatim bhai Huzaifa bhai Vohra", roll: 26698 },
    { id: "st_26707", name: "Mulla Abbas bhai Husain bhai Kalolwala", roll: 26707 },
    { id: "st_26711", name: "Abdeali bhai Qaizar bhai Sadikot", roll: 26711 }
  ]
};
