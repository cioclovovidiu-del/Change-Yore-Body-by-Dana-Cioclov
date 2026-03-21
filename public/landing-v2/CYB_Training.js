// =============================================================================
// CYB TRAINING — Session Database + Deterministic Training Planner
// Requires: CYB_Engine_STABLE.js (getSafetyTags) loaded before this.
// Exports: SESSIONS, EXERCISE_DB, buildTrainingPlan, filterSessions,
//          enrichExercise, formatTrainingPlanHtml
// =============================================================================

// ── SESSION DATABASE ─────────────────────────────────────────────────
// Each session: id, title, type, goalTags[], intensity (1-5),
// durationMin, suitableFor[], avoidFor[], equipment[],
// structure[] (ordered blocks), notes (optional)
//
// goalTags: lose | tone | energy | health
// suitableFor: beginner | intermediate | advanced | postpartum | low_stress | low_capacity
// avoidFor: safety tag strings from getSafetyTags (NO_KNEE, NO_BACK_L, etc.)
// equipment: bodyweight | mat | chair | bands | dumbbells_light | dumbbells_medium | dumbbells_heavy | kettlebell
var SESSIONS = [

  // ═══════════════════════════════════════════════════════════════════
  // FULL BODY LIGHT (beginner / recovery-friendly)
  // ═══════════════════════════════════════════════════════════════════
  {id:'fb_light_01', title:'Full Body Ușor — Debutul Tău', type:'full_body_light',
   goalTags:['lose','energy','health'], intensity:1, durationMin:15,
   suitableFor:['beginner','low_stress','low_capacity','postpartum'],
   avoidFor:[],
   equipment:['bodyweight'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș pe loc', sets:1, reps:'60 sec', rest:'—'},
       {name:'Rotiri umeri', sets:1, reps:'10/direcție', rest:'—'},
       {name:'Înclinări laterale', sets:1, reps:'8/parte', rest:'—'}
     ]},
     {block:'Circuit principal', duration:'10 min', exercises:[
       {name:'Squat la scaun (atingere)', sets:2, reps:'10', rest:'30 sec'},
       {name:'Împingeri perete', sets:2, reps:'10', rest:'30 sec'},
       {name:'Glute bridge', sets:2, reps:'12', rest:'30 sec'},
       {name:'Dead bug (alternativ)', sets:2, reps:'8/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'2 min', exercises:[
       {name:'Stretching cvadriceps în picioare', sets:1, reps:'20 sec/parte', rest:'—'},
       {name:'Respirație diafragmatică', sets:1, reps:'5 respirații', rest:'—'}
     ]}
   ],
   notes:'Ideal pentru prima săptămână sau zile cu energie scăzută.'},

  {id:'fb_light_02', title:'Full Body Blând — Energie Minimă', type:'full_body_light',
   goalTags:['health','energy'], intensity:1, durationMin:15,
   suitableFor:['beginner','low_stress','low_capacity'],
   avoidFor:[],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Plimbare ușoară pe loc', sets:1, reps:'60 sec', rest:'—'},
       {name:'Cercuri cu brațele', sets:1, reps:'10/direcție', rest:'—'}
     ]},
     {block:'Circuit', duration:'10 min', exercises:[
       {name:'Step touch lateral', sets:2, reps:'12/parte', rest:'20 sec'},
       {name:'Genuflexiuni parțiale', sets:2, reps:'10', rest:'30 sec'},
       {name:'Planșă pe genunchi', sets:2, reps:'15 sec', rest:'30 sec'},
       {name:'Superman alternativ', sets:2, reps:'8/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'2 min', exercises:[
       {name:'Stretching ischiogambieri', sets:1, reps:'20 sec/parte', rest:'—'},
       {name:'Child pose', sets:1, reps:'30 sec', rest:'—'}
     ]}
   ],
   notes:'Pentru zilele grele — contează doar că te-ai mișcat.'},

  {id:'fb_light_03', title:'Full Body Activ — Fără Impact', type:'full_body_light',
   goalTags:['lose','tone','health'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate','low_capacity'],
   avoidFor:[],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș cu ridicare genunchi', sets:1, reps:'60 sec', rest:'—'},
       {name:'Rotiri trunchi', sets:1, reps:'8/parte', rest:'—'},
       {name:'Shoulder taps în picioare', sets:1, reps:'10/parte', rest:'—'}
     ]},
     {block:'Circuit principal', duration:'14 min', exercises:[
       {name:'Squat bodyweight', sets:3, reps:'12', rest:'30 sec'},
       {name:'Push-up pe genunchi', sets:3, reps:'8', rest:'30 sec'},
       {name:'Reverse lunge alternativ', sets:3, reps:'8/parte', rest:'30 sec'},
       {name:'Glute bridge cu pauză', sets:3, reps:'10 (2 sec pauză sus)', rest:'30 sec'},
       {name:'Planșă pe antebrațe', sets:2, reps:'20 sec', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Pigeon stretch', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Stretching piept la perete', sets:1, reps:'20 sec/parte', rest:'—'}
     ]}
   ]},

  // ═══════════════════════════════════════════════════════════════════
  // FULL BODY MEDIUM
  // ═══════════════════════════════════════════════════════════════════
  {id:'fb_med_01', title:'Full Body Moderat — Forță + Cardio', type:'full_body_medium',
   goalTags:['lose','tone'], intensity:3, durationMin:30,
   suitableFor:['intermediate','advanced'],
   avoidFor:[],
   equipment:['bodyweight','mat','dumbbells_light'],
   structure:[
     {block:'Încălzire', duration:'4 min', exercises:[
       {name:'Jumping jacks (low impact)', sets:1, reps:'30 sec', rest:'—'},
       {name:'Inchworm', sets:1, reps:'5', rest:'—'},
       {name:'Squat cu rotire trunchi', sets:1, reps:'8', rest:'—'}
     ]},
     {block:'Bloc A — Forță', duration:'12 min', exercises:[
       {name:'Goblet squat (ganteră)', sets:3, reps:'12', rest:'45 sec'},
       {name:'Shoulder press (gantere)', sets:3, reps:'10', rest:'45 sec'},
       {name:'Romanian deadlift (gantere)', sets:3, reps:'10', rest:'45 sec'}
     ]},
     {block:'Bloc B — Circuit metabolic', duration:'10 min', exercises:[
       {name:'Squat cu press', sets:3, reps:'10', rest:'30 sec'},
       {name:'Mountain climbers (lent)', sets:3, reps:'10/parte', rest:'30 sec'},
       {name:'Reverse lunge cu ganteră', sets:3, reps:'8/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'4 min', exercises:[
       {name:'Stretching complet lower body', sets:1, reps:'2 min', rest:'—'},
       {name:'Cat-cow', sets:1, reps:'8 cicluri', rest:'—'}
     ]}
   ]},

  {id:'fb_med_02', title:'Full Body Echilibrat — 25 min', type:'full_body_medium',
   goalTags:['tone','energy','health'], intensity:3, durationMin:25,
   suitableFor:['intermediate'],
   avoidFor:[],
   equipment:['bodyweight','mat','bands'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș cu brațe sus', sets:1, reps:'60 sec', rest:'—'},
       {name:'Band pull apart', sets:1, reps:'12', rest:'—'},
       {name:'Squat cu bandă', sets:1, reps:'8', rest:'—'}
     ]},
     {block:'Circuit principal', duration:'18 min', exercises:[
       {name:'Squat cu bandă la genunchi', sets:3, reps:'12', rest:'30 sec'},
       {name:'Push-up (standard sau genunchi)', sets:3, reps:'10', rest:'30 sec'},
       {name:'Lateral band walk', sets:3, reps:'10/parte', rest:'30 sec'},
       {name:'Bent over row cu bandă', sets:3, reps:'12', rest:'30 sec'},
       {name:'Glute bridge cu bandă', sets:3, reps:'12', rest:'30 sec'},
       {name:'Planșă laterală', sets:2, reps:'15 sec/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'4 min', exercises:[
       {name:'Foam roll / stretching liber', sets:1, reps:'4 min', rest:'—'}
     ]}
   ]},

  {id:'fb_med_03', title:'Full Body Intens — Progres', type:'full_body_medium',
   goalTags:['tone','lose'], intensity:4, durationMin:35,
   suitableFor:['intermediate','advanced'],
   avoidFor:[],
   equipment:['bodyweight','mat','dumbbells_medium'],
   structure:[
     {block:'Încălzire', duration:'5 min', exercises:[
       {name:'Jumping jacks', sets:1, reps:'30 sec', rest:'—'},
       {name:'Inchworm cu push-up', sets:1, reps:'5', rest:'—'},
       {name:'World greatest stretch', sets:1, reps:'4/parte', rest:'—'}
     ]},
     {block:'Bloc A — Superset', duration:'12 min', exercises:[
       {name:'Squat cu gantere', sets:4, reps:'10', rest:'15 sec → next'},
       {name:'Push-up standard', sets:4, reps:'10', rest:'60 sec'}
     ]},
     {block:'Bloc B — Superset', duration:'10 min', exercises:[
       {name:'RDL cu gantere', sets:3, reps:'10', rest:'15 sec → next'},
       {name:'Bent over row cu gantere', sets:3, reps:'10', rest:'60 sec'}
     ]},
     {block:'Finisher', duration:'4 min', exercises:[
       {name:'Burpee modificat (fără săritură)', sets:3, reps:'8', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'4 min', exercises:[
       {name:'Stretching complet', sets:1, reps:'4 min', rest:'—'}
     ]}
   ]},

  // ═══════════════════════════════════════════════════════════════════
  // LOWER BODY
  // ═══════════════════════════════════════════════════════════════════
  {id:'lower_01', title:'Lower Body — Începătoare', type:'lower_body',
   goalTags:['tone','lose'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:['NO_KNEE'],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș pe loc cu ridicare genunchi', sets:1, reps:'60 sec', rest:'—'},
       {name:'Cercuri cu șoldurile', sets:1, reps:'8/direcție', rest:'—'}
     ]},
     {block:'Circuit principal', duration:'14 min', exercises:[
       {name:'Squat bodyweight', sets:3, reps:'12', rest:'30 sec'},
       {name:'Glute bridge', sets:3, reps:'15', rest:'30 sec'},
       {name:'Lateral lunge', sets:3, reps:'8/parte', rest:'30 sec'},
       {name:'Clamshell pe mat', sets:3, reps:'12/parte', rest:'30 sec'},
       {name:'Calf raises', sets:3, reps:'15', rest:'20 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching cvadriceps + ischio', sets:1, reps:'30 sec/grupă', rest:'—'},
       {name:'Figure 4 stretch', sets:1, reps:'30 sec/parte', rest:'—'}
     ]}
   ]},

  {id:'lower_02', title:'Lower Body — Forță Moderată', type:'lower_body',
   goalTags:['tone','lose'], intensity:3, durationMin:30,
   suitableFor:['intermediate','advanced'],
   avoidFor:['NO_KNEE'],
   equipment:['bodyweight','mat','dumbbells_light'],
   structure:[
     {block:'Încălzire', duration:'4 min', exercises:[
       {name:'Marș cu genunchi sus', sets:1, reps:'60 sec', rest:'—'},
       {name:'Squat pulsuri', sets:1, reps:'10', rest:'—'},
       {name:'Glute bridge activare', sets:1, reps:'10', rest:'—'}
     ]},
     {block:'Bloc principal', duration:'22 min', exercises:[
       {name:'Goblet squat', sets:3, reps:'12', rest:'45 sec'},
       {name:'Romanian deadlift cu gantere', sets:3, reps:'10', rest:'45 sec'},
       {name:'Bulgarian split squat (fără greutate)', sets:3, reps:'8/parte', rest:'45 sec'},
       {name:'Hip thrust pe scaun', sets:3, reps:'12', rest:'45 sec'},
       {name:'Sumo squat cu ganteră', sets:3, reps:'12', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'4 min', exercises:[
       {name:'Pigeon stretch', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Stretching complet picioare', sets:1, reps:'2 min', rest:'—'}
     ]}
   ]},

  {id:'lower_03', title:'Lower Body — Fără Genunchi', type:'lower_body',
   goalTags:['tone','health'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș pe loc', sets:1, reps:'60 sec', rest:'—'},
       {name:'Rotiri gleznă', sets:1, reps:'10/direcție', rest:'—'}
     ]},
     {block:'Circuit (knee-safe)', duration:'14 min', exercises:[
       {name:'Glute bridge', sets:3, reps:'15', rest:'30 sec'},
       {name:'Hip thrust pe mat', sets:3, reps:'12', rest:'30 sec'},
       {name:'Fire hydrant', sets:3, reps:'12/parte', rest:'30 sec'},
       {name:'Donkey kicks', sets:3, reps:'12/parte', rest:'30 sec'},
       {name:'Calf raises la perete', sets:3, reps:'15', rest:'20 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching fesieri + ischio', sets:1, reps:'30 sec/grupă', rest:'—'}
     ]}
   ],
   notes:'Sesiune adaptată pentru persoane cu probleme de genunchi — zero flexie profundă.'},

  // ═══════════════════════════════════════════════════════════════════
  // UPPER BODY
  // ═══════════════════════════════════════════════════════════════════
  {id:'upper_01', title:'Upper Body — Brațe și Spate Ușor', type:'upper_body',
   goalTags:['tone','health'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:['NO_SHOULDER'],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Rotiri umeri', sets:1, reps:'10/direcție', rest:'—'},
       {name:'Cercuri cu brațele', sets:1, reps:'10/direcție', rest:'—'},
       {name:'Shoulder taps în planșă pe genunchi', sets:1, reps:'8/parte', rest:'—'}
     ]},
     {block:'Circuit principal', duration:'14 min', exercises:[
       {name:'Push-up pe genunchi', sets:3, reps:'10', rest:'30 sec'},
       {name:'Tricep dips pe scaun', sets:3, reps:'8', rest:'30 sec'},
       {name:'Superman', sets:3, reps:'10', rest:'30 sec'},
       {name:'Planșă pe antebrațe', sets:2, reps:'20 sec', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching triceps + piept', sets:1, reps:'20 sec/grupă', rest:'—'},
       {name:'Child pose', sets:1, reps:'30 sec', rest:'—'}
     ]}
   ]},

  {id:'upper_02', title:'Upper Body — Forță cu Gantere', type:'upper_body',
   goalTags:['tone'], intensity:3, durationMin:25,
   suitableFor:['intermediate','advanced'],
   avoidFor:['NO_SHOULDER'],
   equipment:['dumbbells_light','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Rotiri umeri cu gantere ușoare', sets:1, reps:'10/direcție', rest:'—'},
       {name:'Band pull apart sau towel pull', sets:1, reps:'12', rest:'—'}
     ]},
     {block:'Bloc principal', duration:'18 min', exercises:[
       {name:'Shoulder press', sets:3, reps:'10', rest:'45 sec'},
       {name:'Bent over row', sets:3, reps:'12', rest:'45 sec'},
       {name:'Chest fly pe mat', sets:3, reps:'10', rest:'45 sec'},
       {name:'Bicep curl', sets:3, reps:'12', rest:'30 sec'},
       {name:'Tricep kickback', sets:3, reps:'10', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'4 min', exercises:[
       {name:'Stretching complet upper body', sets:1, reps:'4 min', rest:'—'}
     ]}
   ]},

  // ═══════════════════════════════════════════════════════════════════
  // MOBILITY / RECOVERY
  // ═══════════════════════════════════════════════════════════════════
  {id:'mob_01', title:'Mobilitate — Dimineața', type:'mobility',
   goalTags:['health','energy'], intensity:1, durationMin:12,
   suitableFor:['beginner','intermediate','advanced','postpartum','low_stress','low_capacity'],
   avoidFor:[],
   equipment:['mat'],
   structure:[
     {block:'Flow', duration:'12 min', exercises:[
       {name:'Cat-cow', sets:1, reps:'8 cicluri', rest:'—'},
       {name:'Thread the needle', sets:1, reps:'5/parte', rest:'—'},
       {name:'World greatest stretch', sets:1, reps:'4/parte', rest:'—'},
       {name:'Hip circles (all fours)', sets:1, reps:'8/direcție', rest:'—'},
       {name:'Downward dog pedal', sets:1, reps:'8/parte', rest:'—'},
       {name:'Cobra stretch', sets:1, reps:'5 (3 sec hold)', rest:'—'},
       {name:'Pigeon stretch', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Seated forward fold', sets:1, reps:'30 sec', rest:'—'}
     ]}
   ],
   notes:'Perfect pentru diminețile rigide sau ca încălzire înainte de alt antrenament.'},

  {id:'mob_02', title:'Mobilitate — Seara / Anti-stres', type:'mobility',
   goalTags:['health','energy'], intensity:1, durationMin:15,
   suitableFor:['beginner','intermediate','advanced','postpartum','low_stress','low_capacity'],
   avoidFor:[],
   equipment:['mat'],
   structure:[
     {block:'Flow calm', duration:'15 min', exercises:[
       {name:'Respirație box (4-4-4-4)', sets:1, reps:'5 cicluri', rest:'—'},
       {name:'Neck rolls lente', sets:1, reps:'5/direcție', rest:'—'},
       {name:'Cat-cow lent', sets:1, reps:'8 cicluri', rest:'—'},
       {name:'Child pose', sets:1, reps:'60 sec', rest:'—'},
       {name:'Supine twist', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Legs up the wall', sets:1, reps:'2 min', rest:'—'},
       {name:'Happy baby', sets:1, reps:'30 sec', rest:'—'},
       {name:'Savasana cu respirație', sets:1, reps:'2 min', rest:'—'}
     ]}
   ],
   notes:'Sesiune calmantă pentru seara — ideal după o zi stresantă.'},

  {id:'rec_01', title:'Recovery — Stretching Complet', type:'recovery',
   goalTags:['health'], intensity:1, durationMin:15,
   suitableFor:['beginner','intermediate','advanced','postpartum','low_stress','low_capacity'],
   avoidFor:[],
   equipment:['mat'],
   structure:[
     {block:'Stretching static', duration:'15 min', exercises:[
       {name:'Stretching gât lateral', sets:1, reps:'20 sec/parte', rest:'—'},
       {name:'Stretching piept la ușă', sets:1, reps:'20 sec', rest:'—'},
       {name:'Stretching triceps', sets:1, reps:'20 sec/parte', rest:'—'},
       {name:'Seated hamstring stretch', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Quad stretch în picioare', sets:1, reps:'20 sec/parte', rest:'—'},
       {name:'Figure 4 stretch', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Pigeon stretch', sets:1, reps:'30 sec/parte', rest:'—'},
       {name:'Child pose', sets:1, reps:'60 sec', rest:'—'},
       {name:'Supine twist', sets:1, reps:'30 sec/parte', rest:'—'}
     ]}
   ],
   notes:'Zi de recuperare activă — menține mobilitatea fără efort.'},

  // ═══════════════════════════════════════════════════════════════════
  // WALKING / CARDIO
  // ═══════════════════════════════════════════════════════════════════
  {id:'walk_01', title:'Plimbare Activă — 20 min', type:'walking',
   goalTags:['lose','energy','health'], intensity:1, durationMin:20,
   suitableFor:['beginner','intermediate','advanced','postpartum','low_stress','low_capacity'],
   avoidFor:[],
   equipment:[],
   structure:[
     {block:'Plimbare', duration:'20 min', exercises:[
       {name:'Plimbare ritm normal', sets:1, reps:'5 min', rest:'—'},
       {name:'Plimbare ritm alert', sets:1, reps:'3 min', rest:'—'},
       {name:'Plimbare ritm normal', sets:1, reps:'2 min', rest:'—'},
       {name:'Plimbare ritm alert', sets:1, reps:'3 min', rest:'—'},
       {name:'Plimbare ritm normal', sets:1, reps:'2 min', rest:'—'},
       {name:'Plimbare ritm alert', sets:1, reps:'3 min', rest:'—'},
       {name:'Plimbare răcire', sets:1, reps:'2 min', rest:'—'}
     ]}
   ],
   notes:'Alternare ritm normal/alert — arde calorii fără impact articular.'},

  {id:'walk_02', title:'Plimbare Lungă — 30 min', type:'walking',
   goalTags:['lose','health'], intensity:2, durationMin:30,
   suitableFor:['beginner','intermediate','advanced','postpartum','low_capacity'],
   avoidFor:[],
   equipment:[],
   structure:[
     {block:'Plimbare progresivă', duration:'30 min', exercises:[
       {name:'Plimbare ritm ușor', sets:1, reps:'5 min', rest:'—'},
       {name:'Plimbare ritm moderat', sets:1, reps:'10 min', rest:'—'},
       {name:'Plimbare ritm alert', sets:1, reps:'10 min', rest:'—'},
       {name:'Plimbare răcire', sets:1, reps:'5 min', rest:'—'}
     ]}
   ]},

  // ═══════════════════════════════════════════════════════════════════
  // LOW IMPACT HOME
  // ═══════════════════════════════════════════════════════════════════
  {id:'home_01', title:'Acasă — 15 min fără echipament', type:'low_impact_home',
   goalTags:['lose','tone','energy'], intensity:2, durationMin:15,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bodyweight'],
   structure:[
     {block:'Încălzire', duration:'2 min', exercises:[
       {name:'Marș pe loc', sets:1, reps:'60 sec', rest:'—'},
       {name:'Rotiri trunchi', sets:1, reps:'8/parte', rest:'—'}
     ]},
     {block:'Circuit (3 runde)', duration:'11 min', exercises:[
       {name:'Squat', sets:3, reps:'10', rest:'20 sec'},
       {name:'Push-up pe genunchi', sets:3, reps:'8', rest:'20 sec'},
       {name:'Reverse lunge', sets:3, reps:'8/parte', rest:'20 sec'},
       {name:'Planșă', sets:3, reps:'15 sec', rest:'20 sec'}
     ]},
     {block:'Răcire', duration:'2 min', exercises:[
       {name:'Stretching rapid', sets:1, reps:'2 min', rest:'—'}
     ]}
   ],
   notes:'Când ai doar 15 minute și zero echipament.'},

  {id:'home_02', title:'Acasă — Circuit cu Scaun', type:'low_impact_home',
   goalTags:['tone','energy'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bodyweight','chair'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș pe loc', sets:1, reps:'60 sec', rest:'—'},
       {name:'Shoulder taps la scaun', sets:1, reps:'10/parte', rest:'—'}
     ]},
     {block:'Circuit', duration:'14 min', exercises:[
       {name:'Squat la scaun', sets:3, reps:'12', rest:'30 sec'},
       {name:'Înclinare push-up la scaun', sets:3, reps:'10', rest:'30 sec'},
       {name:'Tricep dip la scaun', sets:3, reps:'8', rest:'30 sec'},
       {name:'Step-up pe scaun (lent)', sets:3, reps:'6/parte', rest:'30 sec'},
       {name:'Planșă cu mâinile pe scaun', sets:2, reps:'20 sec', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching liber', sets:1, reps:'3 min', rest:'—'}
     ]}
   ]},

  {id:'home_03', title:'Acasă — Bandă Elastică Total', type:'low_impact_home',
   goalTags:['tone','lose'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bands','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Band pull apart', sets:2, reps:'10', rest:'—'},
       {name:'Squat cu bandă (activare)', sets:1, reps:'8', rest:'—'}
     ]},
     {block:'Circuit', duration:'14 min', exercises:[
       {name:'Squat cu bandă la genunchi', sets:3, reps:'12', rest:'30 sec'},
       {name:'Lateral band walk', sets:3, reps:'10/parte', rest:'30 sec'},
       {name:'Bicep curl cu bandă', sets:3, reps:'12', rest:'30 sec'},
       {name:'Glute bridge cu bandă', sets:3, reps:'12', rest:'30 sec'},
       {name:'Overhead press cu bandă', sets:3, reps:'10', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching cu bandă', sets:1, reps:'3 min', rest:'—'}
     ]}
   ]},

  // ═══════════════════════════════════════════════════════════════════
  // POSTPARTUM SAFE
  // ═══════════════════════════════════════════════════════════════════
  {id:'pp_01', title:'Postpartum — Reconectare Corp', type:'postpartum_safe',
   goalTags:['health','energy'], intensity:1, durationMin:12,
   suitableFor:['beginner','postpartum','low_capacity'],
   avoidFor:[],
   equipment:['mat'],
   structure:[
     {block:'Respirație + activare', duration:'12 min', exercises:[
       {name:'Respirație diafragmatică', sets:1, reps:'8 respirații', rest:'—'},
       {name:'Activare transvers abdominal (TA)', sets:2, reps:'8 (expir + activare)', rest:'30 sec'},
       {name:'Glute bridge ușor', sets:2, reps:'10', rest:'30 sec'},
       {name:'Heel slides pe spate', sets:2, reps:'8/parte', rest:'30 sec'},
       {name:'Kegel + respirație', sets:2, reps:'8 (5 sec hold)', rest:'30 sec'},
       {name:'Bird dog pe genunchi', sets:2, reps:'6/parte', rest:'30 sec'}
     ]}
   ],
   notes:'Primele 4-8 săptămâni postpartum. Focus pe planșeu pelvian și TA.'},

  {id:'pp_02', title:'Postpartum — Forță Blândă', type:'postpartum_safe',
   goalTags:['tone','health','energy'], intensity:2, durationMin:18,
   suitableFor:['beginner','postpartum'],
   avoidFor:['NO_DIASTASIS'],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Activare', duration:'3 min', exercises:[
       {name:'Respirație diafragmatică', sets:1, reps:'5 respirații', rest:'—'},
       {name:'Pelvic tilt', sets:1, reps:'8', rest:'—'},
       {name:'Glute bridge activare', sets:1, reps:'8', rest:'—'}
     ]},
     {block:'Circuit blând', duration:'12 min', exercises:[
       {name:'Squat bodyweight (paralel)', sets:3, reps:'10', rest:'30 sec'},
       {name:'Push-up la perete', sets:3, reps:'10', rest:'30 sec'},
       {name:'Glute bridge cu pauză', sets:3, reps:'10 (3 sec)', rest:'30 sec'},
       {name:'Bird dog', sets:3, reps:'6/parte', rest:'30 sec'},
       {name:'Lateral step out', sets:3, reps:'8/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Child pose', sets:1, reps:'30 sec', rest:'—'},
       {name:'Stretching ușor', sets:1, reps:'2 min', rest:'—'}
     ]}
   ],
   notes:'După 8+ săptămâni postpartum, cu OK de la medic.'},

  // ═══════════════════════════════════════════════════════════════════
  // BACK-SAFE (for lower back / disc issues)
  // ═══════════════════════════════════════════════════════════════════
  {id:'back_safe_01', title:'Antrenament Sigur — Protecție Spate', type:'low_impact_home',
   goalTags:['health','tone'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Cat-cow lent', sets:1, reps:'8 cicluri', rest:'—'},
       {name:'Pelvic tilt', sets:1, reps:'10', rest:'—'},
       {name:'Marș pe loc (ușor)', sets:1, reps:'60 sec', rest:'—'}
     ]},
     {block:'Circuit (spate-safe)', duration:'14 min', exercises:[
       {name:'Glute bridge', sets:3, reps:'12', rest:'30 sec'},
       {name:'Bird dog', sets:3, reps:'8/parte', rest:'30 sec'},
       {name:'Wall sit', sets:3, reps:'20 sec', rest:'30 sec'},
       {name:'Clamshell', sets:3, reps:'12/parte', rest:'30 sec'},
       {name:'Pallof press (cu bandă sau fără)', sets:2, reps:'8/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Child pose', sets:1, reps:'30 sec', rest:'—'},
       {name:'Supine twist ușor', sets:1, reps:'20 sec/parte', rest:'—'},
       {name:'Knee to chest stretch', sets:1, reps:'20 sec/parte', rest:'—'}
     ]}
   ],
   notes:'Sesiune fără flexie lombară — sigură pentru dureri de spate și hernie de disc.'},

  // ═══════════════════════════════════════════════════════════════════
  // CARDIO (low impact)
  // ═══════════════════════════════════════════════════════════════════
  {id:'cardio_01', title:'Cardio Acasă — Fără Sărituri', type:'walking',
   goalTags:['lose','energy'], intensity:2, durationMin:20,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bodyweight'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș pe loc', sets:1, reps:'60 sec', rest:'—'},
       {name:'Step touch lateral', sets:1, reps:'60 sec', rest:'—'}
     ]},
     {block:'Circuit cardio (3 runde)', duration:'15 min', exercises:[
       {name:'High knees (lent, fără sărituri)', sets:3, reps:'30 sec', rest:'15 sec'},
       {name:'Squat taps', sets:3, reps:'30 sec', rest:'15 sec'},
       {name:'Lateral shuffle (2 pași)', sets:3, reps:'30 sec', rest:'15 sec'},
       {name:'Mountain climbers lenți', sets:3, reps:'30 sec', rest:'15 sec'},
       {name:'Marș cu genunchi sus', sets:3, reps:'30 sec', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'2 min', exercises:[
       {name:'Plimbare pe loc + respirație', sets:1, reps:'2 min', rest:'—'}
     ]}
   ],
   notes:'Cardio fără impact — sigur pentru articulații și vecini.'},

  // ═══════════════════════════════════════════════════════════════════
  // ADDITIONAL VARIETY
  // ═══════════════════════════════════════════════════════════════════
  {id:'fb_light_04', title:'Full Body Ușor — Cu Sticle de Apă', type:'full_body_light',
   goalTags:['tone','energy'], intensity:2, durationMin:18,
   suitableFor:['beginner','intermediate','low_capacity'],
   avoidFor:[],
   equipment:['bodyweight'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș cu rotiri brațe', sets:1, reps:'60 sec', rest:'—'},
       {name:'Squat ușor', sets:1, reps:'8', rest:'—'}
     ]},
     {block:'Circuit cu sticle', duration:'12 min', exercises:[
       {name:'Squat cu sticle la piept', sets:3, reps:'10', rest:'30 sec'},
       {name:'Shoulder press cu sticle', sets:3, reps:'10', rest:'30 sec'},
       {name:'Reverse lunge cu sticle', sets:3, reps:'8/parte', rest:'30 sec'},
       {name:'Bent over row cu sticle', sets:3, reps:'10', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching complet', sets:1, reps:'3 min', rest:'—'}
     ]}
   ],
   notes:'Folosește 2 sticle de 0.5-1.5L ca greutăți improvizate.'},

  {id:'lower_04', title:'Lower Body + Core', type:'lower_body',
   goalTags:['tone','lose'], intensity:3, durationMin:25,
   suitableFor:['intermediate','advanced'],
   avoidFor:['NO_KNEE','NO_BACK_L'],
   equipment:['bodyweight','mat','dumbbells_light'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Marș cu ridicare genunchi', sets:1, reps:'60 sec', rest:'—'},
       {name:'Squat pulsuri', sets:1, reps:'10', rest:'—'}
     ]},
     {block:'Bloc Lower', duration:'12 min', exercises:[
       {name:'Goblet squat', sets:3, reps:'12', rest:'45 sec'},
       {name:'Romanian deadlift', sets:3, reps:'10', rest:'45 sec'},
       {name:'Curtsy lunge', sets:3, reps:'8/parte', rest:'30 sec'}
     ]},
     {block:'Bloc Core', duration:'8 min', exercises:[
       {name:'Dead bug', sets:3, reps:'8/parte', rest:'30 sec'},
       {name:'Planșă laterală', sets:2, reps:'20 sec/parte', rest:'30 sec'},
       {name:'Bicycle crunch (lent)', sets:3, reps:'10/parte', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'2 min', exercises:[
       {name:'Stretching lower body', sets:1, reps:'2 min', rest:'—'}
     ]}
   ]},

  {id:'upper_03', title:'Upper Body — Fără Umeri', type:'upper_body',
   goalTags:['tone','health'], intensity:2, durationMin:18,
   suitableFor:['beginner','intermediate'],
   avoidFor:[],
   equipment:['bodyweight','mat'],
   structure:[
     {block:'Încălzire', duration:'3 min', exercises:[
       {name:'Rotiri încheietură + cot', sets:1, reps:'10/direcție', rest:'—'},
       {name:'Marș pe loc', sets:1, reps:'60 sec', rest:'—'}
     ]},
     {block:'Circuit (shoulder-safe)', duration:'12 min', exercises:[
       {name:'Push-up pe genunchi (coate lipite)', sets:3, reps:'8', rest:'30 sec'},
       {name:'Tricep dip la scaun', sets:3, reps:'8', rest:'30 sec'},
       {name:'Bicep curl izometric (perete)', sets:3, reps:'15 sec hold', rest:'30 sec'},
       {name:'Superman (brațe pe lângă corp)', sets:3, reps:'10', rest:'30 sec'},
       {name:'Planșă pe antebrațe', sets:2, reps:'20 sec', rest:'30 sec'}
     ]},
     {block:'Răcire', duration:'3 min', exercises:[
       {name:'Stretching brațe + piept', sets:1, reps:'3 min', rest:'—'}
     ]}
   ],
   notes:'Sesiune fără overhead work — sigură pentru probleme de umăr.'}
];

// ── EXERCISE DATABASE (B5) ──────────────────────────────────────────
// Lookup: exercise name_ro → {en: name_en, instr: instructions, video_id, modify_if}
// 166 unique exercises. video_id placeholder for future integration.
var EXERCISE_DB = {
  'Activare transvers abdominal (TA)':{en:'Transverse Abdominal Activation',instr:'Contractă mușchii pelvisului, menține 5 sec, relaxează. Respiră normal.'},
  'Band pull apart':{en:'Band Pull Apart',instr:'Menține tensiunea constantă în bandă pe toată mișcarea.'},
  'Band pull apart sau towel pull':{en:'Band Pull Apart / Towel Pull',instr:'Menține tensiunea constantă în bandă pe toată mișcarea.'},
  'Bent over row':{en:'Bent Over Row',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bent over row cu bandă':{en:'Banded Bent Over Row',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bent over row cu gantere':{en:'Dumbbell Bent Over Row',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bent over row cu sticle':{en:'Bent Over Row (Bottles)',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bicep curl':{en:'Bicep Curl',instr:'Menține coatele lipite de corp. Mișcare controlată sus și jos.'},
  'Bicep curl cu bandă':{en:'Banded Bicep Curl',instr:'Menține coatele lipite de corp. Mișcare controlată sus și jos.'},
  'Bicep curl izometric (perete)':{en:'Isometric Wall Bicep Curl',instr:'Menține coatele lipite de corp. Mișcare controlată sus și jos.'},
  'Bicycle crunch (lent)':{en:'Slow Bicycle Crunch',instr:'Mâinile la ceafă, rotește trunchiul ducând cotul spre genunchiul opus.'},
  'Bird dog':{en:'Bird Dog',instr:'Extinde lent brațul și piciorul opus. Menține echilibrul și spatele drept.'},
  'Bird dog pe genunchi':{en:'Kneeling Bird Dog',instr:'Extinde lent brațul și piciorul opus. Menține echilibrul și spatele drept.'},
  'Bulgarian split squat (fără greutate)':{en:'Bulgarian Split Squat (Bodyweight)',instr:'Piciorul din spate pe scaun, coboară controlat cu trunchiul drept.'},
  'Burpee modificat (fără săritură)':{en:'Modified Burpee (No Jump)',instr:'Squat, mâinile pe sol, picioarele înapoi, revin, ridică-te.'},
  'Calf raises':{en:'Calf Raises',instr:'Ridică-te pe vârfuri, menține 2 sec, coboară lent.'},
  'Calf raises la perete':{en:'Wall Calf Raises',instr:'Ridică-te pe vârfuri, menține 2 sec, coboară lent.'},
  'Cat-cow':{en:'Cat-Cow',instr:'Alternează arcuirea și rotunjirea spatelui, sincronizat cu respirația.'},
  'Cat-cow lent':{en:'Slow Cat-Cow',instr:'Alternează arcuirea și rotunjirea spatelui, sincronizat cu respirația.'},
  'Cercuri cu brațele':{en:'Arm Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Cercuri cu șoldurile':{en:'Hip Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Chest fly pe mat':{en:'Floor Chest Fly',instr:'Deschide brațele larg, coboară controlat, adună la piept.'},
  'Child pose':{en:'Child Pose',instr:'Menține poziția confortabil, respiră adânc. Nu forța.'},
  'Clamshell':{en:'Clamshell',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Clamshell pe mat':{en:'Clamshell on Mat',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Cobra stretch':{en:'Cobra Stretch',instr:'Ridică trunchiul ușor sprijinit pe mâini, deschide pieptul. Nu forța.'},
  'Curtsy lunge':{en:'Curtsy Lunge',instr:'Pas lung, coboară controlat. Genunchiul din față nu depășește vârful piciorului.'},
  'Dead bug':{en:'Dead Bug',instr:'Menține spatele lipit de sol. Extinde lent și controlat mâna și piciorul opus.'},
  'Dead bug (alternativ)':{en:'Alternating Dead Bug',instr:'Menține spatele lipit de sol. Extinde lent și controlat mâna și piciorul opus.'},
  'Donkey kicks':{en:'Donkey Kicks',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Downward dog pedal':{en:'Downward Dog Pedal',instr:'În V inversat, alternează călcâiele spre sol, simte stretching-ul.'},
  'Figure 4 stretch':{en:'Figure 4 Stretch',instr:'Pune glezna pe genunchiul opus, trage ușor spre piept.'},
  'Fire hydrant':{en:'Fire Hydrant',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Foam roll / stretching liber':{en:'Foam Roll / Free Stretch',instr:'Menține poziția confortabil, respiră adânc. Nu forța.'},
  'Genuflexiuni parțiale':{en:'Partial Squats',instr:'Coboară parțial cu spatele drept, împinge din călcâie la ridicare.'},
  'Glute bridge':{en:'Glute Bridge',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Glute bridge activare':{en:'Glute Bridge Activation',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Glute bridge cu bandă':{en:'Banded Glute Bridge',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Glute bridge cu pauză':{en:'Glute Bridge with Pause',instr:'Ridică șoldurile contractând fesierii. Menține 3 sec sus.'},
  'Glute bridge ușor':{en:'Easy Glute Bridge',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Goblet squat':{en:'Goblet Squat',instr:'Ține gantera la piept, coboară în squat profund. Spatele drept.'},
  'Goblet squat (ganteră)':{en:'Dumbbell Goblet Squat',instr:'Ține gantera la piept, coboară în squat profund. Spatele drept.'},
  'Happy baby':{en:'Happy Baby',instr:'Pe spate, prinde tălpile cu mâinile, balansează ușor.'},
  'Heel slides pe spate':{en:'Supine Heel Slides',instr:'Pe spate, alunecă călcâiul pe sol alternativ. Abdomenul activat.'},
  'High knees (lent, fără sărituri)':{en:'Slow High Knees (No Jump)',instr:'Ridică genunchii alternativ spre piept, menținând ritmul.'},
  'Hip circles (all fours)':{en:'Hip Circles (All Fours)',instr:'Pe patru labe, cercuri cu genunchiul. Menține trunchiul stabil.'},
  'Hip thrust pe mat':{en:'Hip Thrust on Mat',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Hip thrust pe scaun':{en:'Hip Thrust (Chair)',instr:'Spatele sprijinit pe scaun, ridică șoldurile contractând fesierii.'},
  'Inchworm':{en:'Inchworm',instr:'Pleacă din picioare, mergi cu mâinile până la planșă, revino.'},
  'Inchworm cu push-up':{en:'Inchworm to Push-up',instr:'Inchworm cu o flotare la capăt, apoi revino în picioare.'},
  'Jumping jacks':{en:'Jumping Jacks',instr:'Sari deschizând picioarele și brațele simultan. Aterizează moale.'},
  'Jumping jacks (low impact)':{en:'Low Impact Jumping Jacks',instr:'Pas lateral cu brațele deasupra, fără săritură.'},
  'Kegel + respirație':{en:'Kegel + Breathing',instr:'Contractă mușchii pelvisului la expirare, relaxează la inspirare.'},
  'Knee to chest stretch':{en:'Knee to Chest Stretch',instr:'Pe spate, trage genunchiul spre piept. Menține 20 sec/parte.'},
  'Lateral band walk':{en:'Lateral Band Walk',instr:'Banda la genunchi, pași laterali mici, menține tensiunea.'},
  'Lateral lunge':{en:'Lateral Lunge',instr:'Pas lateral larg, coboară pe un picior, celălalt drept.'},
  'Lateral shuffle (2 pași)':{en:'Lateral Shuffle (2 Steps)',instr:'Pași laterali rapizi, genunchii ușor flexați, greutatea pe vârfuri.'},
  'Lateral step out':{en:'Lateral Step Out',instr:'Pas lateral controlat, revino la centru. Menține echilibrul.'},
  'Legs up the wall':{en:'Legs Up the Wall',instr:'Întinde-te cu picioarele pe perete 2-5 min. Respiră adânc.'},
  'Marș cu brațe sus':{en:'March with Arms Up',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș cu genunchi sus':{en:'March with High Knees',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș cu ridicare genunchi':{en:'March with Knee Raise',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș cu rotiri brațe':{en:'March with Arm Circles',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș pe loc':{en:'March in Place',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș pe loc (ușor)':{en:'March in Place (Easy)',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș pe loc cu ridicare genunchi':{en:'March in Place with Knee Raise',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Mountain climbers (lent)':{en:'Slow Mountain Climbers',instr:'Adu genunchii alternativ spre piept, menținând corpul drept.'},
  'Mountain climbers lenți':{en:'Slow Mountain Climbers',instr:'Adu genunchii alternativ spre piept, menținând corpul drept.'},
  'Neck rolls lente':{en:'Slow Neck Rolls',instr:'Mișcări lente, controlate. Nu forța amplitudinea.'},
  'Overhead press cu bandă':{en:'Banded Overhead Press',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Pallof press (cu bandă sau fără)':{en:'Pallof Press',instr:'Împinge brațele în față rezistând rotației trunchiului. Abdomen activat.'},
  'Pelvic tilt':{en:'Pelvic Tilt',instr:'Pe spate, aplatizează zona lombară pe sol contractând abdomenul.'},
  'Pigeon stretch':{en:'Pigeon Stretch',instr:'Un genunchi în față, celălalt picior întins în spate. Relaxează șoldul.'},
  'Planșă':{en:'Plank',instr:'Corp drept din cap până la călcâie. Abdomen contractat, respiră normal.'},
  'Planșă cu mâinile pe scaun':{en:'Elevated Plank (Chair)',instr:'Corp drept din cap până la călcâie. Abdomen contractat, respiră normal.'},
  'Planșă laterală':{en:'Side Plank',instr:'Corp drept, sprijin pe antebraț, șoldul ridicat. Abdomen activat.'},
  'Planșă pe antebrațe':{en:'Forearm Plank',instr:'Corp drept din cap până la călcâie. Abdomen contractat, respiră normal.'},
  'Planșă pe genunchi':{en:'Knee Plank',instr:'Corp drept din cap până la genunchi. Abdomen contractat, respiră normal.'},
  'Plimbare pe loc + respirație':{en:'Walk in Place + Breathing',instr:'Pași liniștiți pe loc, sincronizează respirația.'},
  'Plimbare ritm alert':{en:'Brisk Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare ritm moderat':{en:'Moderate Pace Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare ritm normal':{en:'Normal Pace Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare ritm ușor':{en:'Easy Pace Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare răcire':{en:'Cooldown Walk',instr:'Pași liniștiți pentru răcire, scade pulsul treptat.'},
  'Plimbare ușoară pe loc':{en:'Easy Walk in Place',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Push-up (standard sau genunchi)':{en:'Push-up (Standard or Knee)',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Push-up la perete':{en:'Wall Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Push-up pe genunchi':{en:'Knee Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Push-up pe genunchi (coate lipite)':{en:'Close-Grip Knee Push-up',instr:'Coboară controlat cu coatele lipite de corp, împinge cu forță înapoi.'},
  'Push-up standard':{en:'Standard Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Quad stretch în picioare':{en:'Standing Quad Stretch',instr:'Prinde glezna, trage călcâiul spre fesier. Menține echilibrul.'},
  'RDL cu gantere':{en:'Dumbbell RDL',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Respirație box (4-4-4-4)':{en:'Box Breathing (4-4-4-4)',instr:'Inspiră 4 sec, ține 4 sec, expiră 4 sec, ține 4 sec.'},
  'Respirație diafragmatică':{en:'Diaphragmatic Breathing',instr:'Inspiră adânc pe nas umflând abdomenul, expiră lent pe gură.'},
  'Reverse lunge':{en:'Reverse Lunge',instr:'Pas lung înapoi, coboară controlat. Genunchiul din față la 90°.'},
  'Reverse lunge alternativ':{en:'Alternating Reverse Lunge',instr:'Pas lung înapoi alternativ, coboară controlat.'},
  'Reverse lunge cu ganteră':{en:'Dumbbell Reverse Lunge',instr:'Pas lung înapoi, coboară controlat. Gantere în mâini.'},
  'Reverse lunge cu sticle':{en:'Reverse Lunge with Bottles',instr:'Pas lung înapoi, coboară controlat. Sticle ca greutăți.'},
  'Romanian deadlift':{en:'Romanian Deadlift',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Romanian deadlift (gantere)':{en:'Dumbbell Romanian Deadlift',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Romanian deadlift cu gantere':{en:'Dumbbell Romanian Deadlift',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Rotiri gleznă':{en:'Ankle Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri trunchi':{en:'Trunk Rotations',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri umeri':{en:'Shoulder Rolls',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri umeri cu gantere ușoare':{en:'Shoulder Rolls with Light Dumbbells',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri încheietură + cot':{en:'Wrist + Elbow Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Savasana cu respirație':{en:'Savasana with Breathing',instr:'Stai întinsă, relaxează fiecare parte a corpului. Respiră adânc.'},
  'Seated forward fold':{en:'Seated Forward Fold',instr:'Stai cu picioarele întinse, aplecă-te înainte din șold. Nu forța.'},
  'Seated hamstring stretch':{en:'Seated Hamstring Stretch',instr:'Un picior întins, aplecă-te spre el. Menține 20 sec/parte.'},
  'Shoulder press':{en:'Shoulder Press',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Shoulder press (gantere)':{en:'Dumbbell Shoulder Press',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Shoulder press cu sticle':{en:'Shoulder Press (Bottles)',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Shoulder taps la scaun':{en:'Chair Shoulder Taps',instr:'În planșă pe scaun, atinge umărul opus alternativ. Trunchiul stabil.'},
  'Shoulder taps în picioare':{en:'Standing Shoulder Taps',instr:'Atinge umărul opus alternativ, menținând trunchiul stabil.'},
  'Shoulder taps în planșă pe genunchi':{en:'Knee Plank Shoulder Taps',instr:'În planșă pe genunchi, atinge umărul opus. Trunchiul stabil.'},
  'Squat':{en:'Squat',instr:'Coboară cu spatele drept, genunchii în linie cu degetele. Împinge din călcâie.'},
  'Squat bodyweight':{en:'Bodyweight Squat',instr:'Coboară cu spatele drept, genunchii în linie cu degetele. Împinge din călcâie.'},
  'Squat bodyweight (paralel)':{en:'Bodyweight Squat (Parallel)',instr:'Coboară până coapsa e paralelă cu solul. Spatele drept.'},
  'Squat cu bandă':{en:'Banded Squat',instr:'Banda la genunchi, coboară controlat împingând genunchii în afară.'},
  'Squat cu bandă (activare)':{en:'Banded Squat (Activation)',instr:'Banda la genunchi, coboară controlat împingând genunchii în afară.'},
  'Squat cu bandă la genunchi':{en:'Banded Squat (Knee)',instr:'Banda la genunchi, coboară controlat împingând genunchii în afară.'},
  'Squat cu gantere':{en:'Dumbbell Squat',instr:'Gantere la umeri, coboară controlat. Spatele drept.'},
  'Squat cu press':{en:'Squat to Press',instr:'Squat și la ridicare împinge ganterele deasupra capului.'},
  'Squat cu rotire trunchi':{en:'Squat with Trunk Rotation',instr:'Squat și rotire trunchi la ridicare. Mișcare controlată.'},
  'Squat cu sticle la piept':{en:'Goblet Squat (Bottles)',instr:'Sticle la piept, coboară în squat profund. Spatele drept.'},
  'Squat la scaun':{en:'Box Squat',instr:'Coboară până atingi scaunul, ridică-te din călcâie.'},
  'Squat la scaun (atingere)':{en:'Box Squat (Touch)',instr:'Coboară până atingi scaunul, ridică-te din călcâie.'},
  'Squat pulsuri':{en:'Pulse Squat',instr:'Coboară în squat și pulsează mici mișcări sus-jos.'},
  'Squat taps':{en:'Squat Taps',instr:'Squat cu atingere laterală alternativă a piciorului.'},
  'Squat ușor':{en:'Easy Squat',instr:'Coboară parțial, menține spatele drept. Împinge din călcâie.'},
  'Step touch lateral':{en:'Lateral Step Touch',instr:'Pas lateral cu atingere, menține ritmul.'},
  'Step-up pe scaun (lent)':{en:'Step-up on Chair (Slow)',instr:'Urcă controlat pe scaun, împinge din călcâie. Alternează picioarele.'},
  'Stretching brațe + piept':{en:'Arm + Chest Stretch',instr:'Menține poziția confortabil, respiră adânc. Nu forța.'},
  'Stretching complet':{en:'Full Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching complet lower body':{en:'Lower Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching complet picioare':{en:'Leg Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching complet upper body':{en:'Upper Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching cu bandă':{en:'Band-Assisted Stretch',instr:'Folosește banda pentru a asista stretching-ul. Nu forța.'},
  'Stretching cvadriceps + ischio':{en:'Quad + Hamstring Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching cvadriceps în picioare':{en:'Standing Quad Stretch',instr:'Prinde glezna, trage călcâiul spre fesier. Menține 20 sec.'},
  'Stretching fesieri + ischio':{en:'Glute + Hamstring Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching gât lateral':{en:'Lateral Neck Stretch',instr:'Înclină capul lateral ușor. Menține 15 sec/parte.'},
  'Stretching ischiogambieri':{en:'Hamstring Stretch',instr:'Piciorul întins, aplecă-te înainte din șold. Menține 20 sec.'},
  'Stretching liber':{en:'Free Stretch',instr:'Stretching la alegere, concentrează-te pe zonele tensionate.'},
  'Stretching lower body':{en:'Lower Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching piept la perete':{en:'Wall Chest Stretch',instr:'Brațul pe perete la 90°, rotește trunchiul ușor.'},
  'Stretching piept la ușă':{en:'Doorway Chest Stretch',instr:'Brațele pe cadrul ușii, fă un pas înainte pentru stretch.'},
  'Stretching rapid':{en:'Quick Stretch',instr:'Stretch-uri scurte 10-15 sec pe grupele principale.'},
  'Stretching triceps':{en:'Triceps Stretch',instr:'Brațul deasupra capului, trage cotul cu mâna opusă.'},
  'Stretching triceps + piept':{en:'Triceps + Chest Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching ușor':{en:'Easy Stretch',instr:'Mișcări blânde de stretching, nu forța amplitudinea.'},
  'Sumo squat cu ganteră':{en:'Dumbbell Sumo Squat',instr:'Picioare depărtate, vârfuri în afară. Coboară drept, împinge din călcâie.'},
  'Superman':{en:'Superman',instr:'Ridică simultan brațele și picioarele de pe sol. Menține 2 sec sus.'},
  'Superman (brațe pe lângă corp)':{en:'Superman (Arms by Side)',instr:'Ridică trunchiul și picioarele, brațele pe lângă corp.'},
  'Superman alternativ':{en:'Alternating Superman',instr:'Ridică alternativ brațul și piciorul opus. Menține 2 sec.'},
  'Supine twist':{en:'Supine Twist',instr:'Pe spate, genunchii într-o parte, privirea în cealaltă. Relaxează.'},
  'Supine twist ușor':{en:'Easy Supine Twist',instr:'Pe spate, genunchii într-o parte, privirea în cealaltă. Relaxează.'},
  'Thread the needle':{en:'Thread the Needle',instr:'Pe patru labe, strecoară brațul pe sub corp, rotește trunchiul.'},
  'Tricep dip la scaun':{en:'Chair Tricep Dip',instr:'Mâinile pe marginea scaunului, coboară controlat flexând coatele.'},
  'Tricep dips pe scaun':{en:'Chair Tricep Dips',instr:'Mâinile pe marginea scaunului, coboară controlat flexând coatele.'},
  'Tricep kickback':{en:'Tricep Kickback',instr:'Aplecat înainte, extinde brațul înapoi complet. Contractă tricepsul.'},
  'Wall sit':{en:'Wall Sit',instr:'Spatele lipit de perete, genunchii la 90°. Menține poziția.'},
  'World greatest stretch':{en:'World\'s Greatest Stretch',instr:'Lunge cu rotire trunchi și extensie braț. Stretch complet.'},
  'Împingeri perete':{en:'Wall Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Înclinare push-up la scaun':{en:'Incline Push-up (Chair)',instr:'Mâinile pe scaun, coboară controlat, împinge înapoi.'},
  'Înclinări laterale':{en:'Side Bends',instr:'Înclină trunchiul lateral alternativ, mișcare controlată.'}
};

// ── ENRICH EXERCISE ─────────────────────────────────────────────────
// Merges EXERCISE_DB data into an exercise object.
// Returns enriched copy with name_en, instructions, video_id, modify_if.
function enrichExercise(ex) {
  if (!ex || !ex.name) return ex;
  var db = EXERCISE_DB[ex.name];
  if (!db) return ex;
  return {
    name: ex.name,
    name_en: db.en || ex.name,
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.rest,
    instructions: db.instr || '',
    video_id: db.video_id || null,
    modify_if: db.modify_if || null
  };
}


// ── EXPERIENCE LEVEL MAP ─────────────────────────────────────────────
// Maps q13 → suitableFor tag
var EXP_MAP = {0:'beginner', 1:'beginner', 2:'intermediate', 3:'advanced'};

// ── TIME BUDGET MAP ──────────────────────────────────────────────────
// Maps q8 → max duration minutes
var TIME_MAP = {0:15, 1:20, 2:30, 3:45, 4:60};

// ── EQUIPMENT MAP ────────────────────────────────────────────────────
// Maps q9 indices → session equipment tags
var EQUIP_MAP = {
  0:'bodyweight', 1:'chair', 2:'mat', 3:'bodyweight',
  4:'bands', 5:'dumbbells_light', 6:'dumbbells_medium',
  7:'dumbbells_heavy', 8:'kettlebell', 9:'bodyweight'
};

// ── SAFETY TAG → avoidFor MAPPING ────────────────────────────────────
var SAFETY_AVOID = [
  'NO_KNEE','NO_BACK_L','NO_BACK_C','NO_SHOULDER','NO_HIP',
  'NO_DISC','NO_DIASTASIS','NO_STANDING_LONG','NO_POSITION_CHANGE'
];


// ── FILTER SESSIONS ──────────────────────────────────────────────────
// Returns sessions matching user constraints, sorted by id (deterministic).
function filterSessions(profile, ans) {
  profile = profile || {}; ans = ans || {};

  // Resolve experience level
  var exp = ans.q13 !== undefined ? ans.q13 : 0;
  var level = EXP_MAP[exp] || 'beginner';

  // Resolve time budget
  var timeIdx = ans.q8 !== undefined ? ans.q8 : 2;
  var maxDuration = TIME_MAP[timeIdx] || 30;

  // Resolve user equipment
  var userEquipRaw = ans.q9 || [0]; // default: bodyweight only
  var userEquip = {};
  userEquip['bodyweight'] = true; // always available
  userEquip['mat'] = true;        // assume mat always available
  for (var i = 0; i < userEquipRaw.length; i++) {
    var eq = EQUIP_MAP[userEquipRaw[i]];
    if (eq) userEquip[eq] = true;
  }

  // Resolve safety tags to build avoidSet
  var safetyTags = [];
  try { safetyTags = getSafetyTags(profile, ans); } catch(e) { /* ignore if not loaded */ }
  var avoidSet = {};
  for (var t = 0; t < safetyTags.length; t++) {
    if (safetyTags[t].type === 'exclude') {
      avoidSet[safetyTags[t].tag] = true;
    }
  }

  // Postpartum flag
  var isPostpartum = profile.moment === 0;

  // Stress/capacity indicators
  var stress = ans.q6 !== undefined ? ans.q6 : 1;
  var sleep = ans.q5 !== undefined ? ans.q5 : 1;
  var isLowCapacity = (stress >= 2 && sleep >= 2) || stress >= 3;

  var filtered = [];
  for (var j = 0; j < SESSIONS.length; j++) {
    var s = SESSIONS[j];

    // Duration filter
    if (s.durationMin > maxDuration) continue;

    // Equipment filter: all required equipment must be available
    var equipOk = true;
    for (var k = 0; k < s.equipment.length; k++) {
      if (!userEquip[s.equipment[k]]) { equipOk = false; break; }
    }
    if (!equipOk) continue;

    // Safety: skip sessions whose avoidFor tags match user's safety exclusions
    var safetyOk = true;
    for (var a = 0; a < s.avoidFor.length; a++) {
      if (avoidSet[s.avoidFor[a]]) { safetyOk = false; break; }
    }
    if (!safetyOk) continue;

    // Level filter: session must be suitable for user's level
    if (s.suitableFor.indexOf(level) === -1) {
      // Exception: always allow beginner sessions for higher levels
      if (s.suitableFor.indexOf('beginner') === -1 || level === 'beginner') continue;
    }

    // Postpartum filter: if user is postpartum, prefer postpartum-safe sessions
    // (non-postpartum sessions are still allowed if they're suitable)
    // If session is postpartum_safe type but user isn't postpartum, skip it
    if (s.type === 'postpartum_safe' && !isPostpartum) continue;

    // Intensity filter for low capacity users
    if (isLowCapacity && s.intensity > 2) continue;

    filtered.push(s);
  }

  // Sort by id for determinism
  filtered.sort(function(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });

  return filtered;
}


// ── DETERMINE WEEKLY FREQUENCY ───────────────────────────────────────
function resolveFrequency(profile, ans) {
  ans = ans || {}; profile = profile || {};
  var activity = profile.activity !== undefined ? profile.activity : 0;
  var stress = ans.q6 !== undefined ? ans.q6 : 1;
  var sleep = ans.q5 !== undefined ? ans.q5 : 1;
  var time = ans.q8 !== undefined ? ans.q8 : 2;

  // Base frequency from activity level
  var freq;
  if (activity <= 0) freq = 2;
  else if (activity === 1) freq = 3;
  else if (activity === 2) freq = 4;
  else freq = 5;

  // Reduce for high stress / poor sleep
  if (stress >= 3) freq = Math.max(freq - 1, 2);
  if (sleep >= 3) freq = Math.max(freq - 1, 2);

  // Reduce for very limited time
  if (time <= 0) freq = Math.min(freq, 3);

  // Postpartum: cap at 3
  if (profile.moment === 0) freq = Math.min(freq, 3);

  // Burnout/loss: cap at 3
  if (profile.moment === 3 || profile.moment === 4) freq = Math.min(freq, 3);

  return Math.max(freq, 2); // minimum 2 sessions/week
}


// ── RESOLVE WEEKLY GOAL LABEL ────────────────────────────────────────
function resolveWeeklyGoal(profile, ans, frequency) {
  var goal = profile.goal !== undefined ? profile.goal : 3;
  var stress = ans.q6 !== undefined ? ans.q6 : 1;

  if (profile.moment === 0) return 'Reconectare cu corpul — mișcare blândă, sigură postpartum';
  if (profile.moment === 4) return 'Mișcare ca terapie — fără presiune, fără cronometru';
  if (stress >= 3 || profile.moment === 3) return 'Reducerea stresului prin mișcare — zero presiune';

  if (goal === 0) return 'Ardere calorică + tonifiere — ' + frequency + ' sesiuni/săptămână';
  if (goal === 1) return 'Tonifiere și forță — ' + frequency + ' sesiuni/săptămână';
  if (goal === 2) return 'Energie și vitalitate — ' + frequency + ' sesiuni/săptămână';
  return 'Sănătate generală și echilibru — ' + frequency + ' sesiuni/săptămână';
}


// ── SESSION TYPE PRIORITY BY GOAL ────────────────────────────────────
var GOAL_TYPE_PRIORITY = {
  0: ['full_body_medium','full_body_light','lower_body','walking','low_impact_home','upper_body','mobility','recovery','postpartum_safe'],
  1: ['full_body_medium','lower_body','upper_body','full_body_light','low_impact_home','mobility','walking','recovery','postpartum_safe'],
  2: ['full_body_light','walking','mobility','low_impact_home','full_body_medium','recovery','lower_body','upper_body','postpartum_safe'],
  3: ['full_body_light','mobility','walking','recovery','low_impact_home','full_body_medium','lower_body','upper_body','postpartum_safe']
};

// Postpartum priority
var PP_TYPE_PRIORITY = ['postpartum_safe','mobility','walking','recovery','full_body_light','low_impact_home'];

// Low capacity priority
var LOW_CAP_PRIORITY = ['mobility','walking','recovery','full_body_light','low_impact_home','postpartum_safe'];


// ── BUILD TRAINING PLAN ──────────────────────────────────────────────
// Returns a deterministic weekly training plan.
// Output: { weeklyGoal, frequency, sessions[], totalMinutes }
function buildTrainingPlan(profile, ans) {
  profile = profile || {}; ans = ans || {};

  var frequency = resolveFrequency(profile, ans);
  var weeklyGoal = resolveWeeklyGoal(profile, ans, frequency);

  var available = filterSessions(profile, ans);

  // If no sessions match (extreme filter), fallback to all safe low-intensity
  if (available.length === 0) {
    available = SESSIONS.filter(function(s) {
      return s.intensity <= 2 && s.avoidFor.length === 0;
    });
    available.sort(function(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
  }

  // Still empty? Ultimate fallback: walking + mobility
  if (available.length === 0) {
    available = SESSIONS.filter(function(s) {
      return s.type === 'walking' || s.type === 'mobility' || s.type === 'recovery';
    });
    available.sort(function(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
  }

  // Determine type priority based on context
  var isPostpartum = profile.moment === 0;
  var stress = ans.q6 !== undefined ? ans.q6 : 1;
  var sleep = ans.q5 !== undefined ? ans.q5 : 1;
  var isLowCapacity = (stress >= 2 && sleep >= 2) || stress >= 3;

  var typePriority;
  if (isPostpartum) {
    typePriority = PP_TYPE_PRIORITY;
  } else if (isLowCapacity) {
    typePriority = LOW_CAP_PRIORITY;
  } else {
    var goal = profile.goal !== undefined ? profile.goal : 3;
    typePriority = GOAL_TYPE_PRIORITY[goal] || GOAL_TYPE_PRIORITY[3];
  }

  // Build session list: pick top sessions by type priority, no duplicates
  var selected = [];
  var usedIds = {};
  var usedTypes = {};

  // Ensure variety: always include recovery/mobility for freq >= 3
  var needRecovery = (frequency >= 3);

  for (var p = 0; p < typePriority.length && selected.length < frequency; p++) {
    var targetType = typePriority[p];

    // Find best matching session of this type
    for (var s = 0; s < available.length; s++) {
      if (selected.length >= frequency) break;
      var sess = available[s];
      if (usedIds[sess.id]) continue;
      if (sess.type !== targetType) continue;

      // Goal tag match bonus: prefer sessions matching user goal
      var goalTag = ['lose','tone','energy','health'][profile.goal || 3];
      var hasGoalTag = sess.goalTags.indexOf(goalTag) !== -1;

      // Pick it
      usedIds[sess.id] = true;
      usedTypes[targetType] = true;
      selected.push(sess);
      break; // one per type per pass
    }
  }

  // If still not enough sessions, fill from available (by id order, skip used)
  for (var f = 0; f < available.length && selected.length < frequency; f++) {
    if (!usedIds[available[f].id]) {
      usedIds[available[f].id] = true;
      selected.push(available[f]);
    }
  }

  // If frequency >= 3 and no recovery/mobility selected, swap last session
  if (needRecovery && selected.length >= 3) {
    var hasRecovery = false;
    for (var r = 0; r < selected.length; r++) {
      if (selected[r].type === 'mobility' || selected[r].type === 'recovery' || selected[r].type === 'walking') {
        hasRecovery = true; break;
      }
    }
    if (!hasRecovery) {
      // Find a recovery/mobility session from available
      for (var m = 0; m < available.length; m++) {
        var ms = available[m];
        if ((ms.type === 'mobility' || ms.type === 'recovery') && !usedIds[ms.id]) {
          selected[selected.length - 1] = ms; // replace last
          break;
        }
      }
    }
  }

  // Sort selected by intensity (lighter first, heavier mid-week)
  selected.sort(function(a, b) {
    if (a.intensity !== b.intensity) return a.intensity - b.intensity;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  // Calculate total minutes
  var totalMinutes = 0;
  for (var tm = 0; tm < selected.length; tm++) {
    totalMinutes += selected[tm].durationMin;
  }

  return {
    weeklyGoal: weeklyGoal,
    frequency: frequency,
    sessions: selected,
    totalMinutes: totalMinutes
  };
}


// ── FORMAT TRAINING PLAN HTML ────────────────────────────────────────
// Returns HTML string for displaying a training plan preview.
function formatTrainingPlanHtml(plan) {
  if (!plan || !plan.sessions || plan.sessions.length === 0) {
    return '<p style="color:var(--muted)">Nu s-a putut genera un plan de antrenament.</p>';
  }

  var dayLabels = ['Ziua 1','Ziua 2','Ziua 3','Ziua 4','Ziua 5','Ziua 6','Ziua 7'];
  var intensityLabels = {1:'Ușor', 2:'Moderat', 3:'Mediu', 4:'Intens', 5:'Avansat'};
  var intensityColors = {1:'#4ade80', 2:'#a3e635', 3:'#facc15', 4:'#fb923c', 5:'#f87171'};

  var html = '<div class="training-plan" style="text-align:left;">';
  html += '<p style="color:var(--accent);font-weight:600;margin-bottom:4px;">Antrenamentul tău — Săptămâna 1</p>';
  html += '<p style="color:var(--muted);font-size:13px;margin-top:0;margin-bottom:12px;">' + plan.weeklyGoal + '</p>';

  for (var i = 0; i < plan.sessions.length; i++) {
    var s = plan.sessions[i];
    var intLabel = intensityLabels[s.intensity] || 'Moderat';
    var intColor = intensityColors[s.intensity] || '#facc15';

    html += '<div style="margin-bottom:10px;padding:10px 12px;background:rgba(200,169,110,0.08);border-radius:8px;border-left:3px solid ' + intColor + ';">';
    html += '<div style="display:flex;justify-content:space-between;align-items:center;">';
    html += '<span style="color:var(--accent);font-size:13px;font-weight:600;">' + dayLabels[i] + '</span>';
    html += '<span style="color:' + intColor + ';font-size:11px;font-weight:500;">' + intLabel + '</span>';
    html += '</div>';
    html += '<p style="color:var(--text);font-size:14px;margin:4px 0 2px;">' + s.title + '</p>';
    html += '<span style="color:var(--muted);font-size:12px;">' + s.durationMin + ' min';

    // Show first 3 exercises as preview
    if (s.structure && s.structure.length > 0) {
      var exercises = [];
      for (var b = 0; b < s.structure.length && exercises.length < 3; b++) {
        var block = s.structure[b];
        for (var e = 0; e < block.exercises.length && exercises.length < 3; e++) {
          exercises.push(block.exercises[e].name);
        }
      }
      if (exercises.length > 0) {
        html += ' · ' + exercises.join(', ');
      }
    }
    html += '</span></div>';
  }

  html += '<p style="color:var(--muted);font-size:12px;margin-top:8px;">Total: ~' + plan.totalMinutes + ' min/săptămână · ' + plan.frequency + ' sesiuni</p>';
  html += '</div>';
  return html;
}
