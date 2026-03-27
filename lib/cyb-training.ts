// =============================================================================
// CYB TRAINING — Session Database + Deterministic Training Planner
// Extracted from: public/landing-v2/CYB_Training.js
// Exports: SESSIONS, EXERCISE_DB, buildTrainingPlan, filterSessions,
//          enrichExercise (excludes formatTrainingPlanHtml — stays in browser)
// Pure data + logic: no DOM, no state, no browser APIs.
// =============================================================================

import { getSafetyTags } from "./cyb-engine";

// ── Interfaces ──────────────────────────────────────────────────────

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
}

export interface ExerciseBlock {
  block: string;
  duration: string;
  exercises: Exercise[];
}

export interface Session {
  id: string;
  title: string;
  type: string;
  goalTags: string[];
  intensity: number;
  durationMin: number;
  suitableFor: string[];
  avoidFor: string[];
  equipment: string[];
  structure: ExerciseBlock[];
  notes?: string;
}

// ── Exercise media pointers (future video/image integration) ────────
export interface ExerciseMedia {
  canonicalVideoId?: string;
  angleFrontId?: string;
  angleSideId?: string;
  angleRearId?: string;
  posterImageId?: string;
  loopSeconds?: number;
}

export interface ExerciseDBEntry {
  en: string;
  instr: string;
  video_id?: string;
  modify_if?: string;
  // Phase 1 — future-facing fields (all optional for backward compat)
  displayName?: string;       // Client-facing name (fallback: en)
  shortDesc?: string;         // Short description (fallback: instr)
  muscleGroups?: string[];    // e.g. ['glutes','quads'] — for filtering/grouping
  category?: string;          // e.g. 'compound','isolation','mobility','cardio'
  difficulty?: 1 | 2 | 3;    // 1=beginner, 2=intermediate, 3=advanced
  canProgress?: boolean;      // Whether sets/reps can increase across weeks
  illustrationId?: string;    // Static illustration asset ID
  media?: ExerciseMedia;      // Video/image pointers
}

// ── Enriched exercise (output of enrichExercise) ────────────────────
export interface EnrichedExercise {
  name: string;
  name_en: string;
  sets: number;
  reps: string;
  rest: string;
  instructions: string;
  video_id: string | null;
  modify_if: string | null;
  // Normalized future-facing fields
  displayName: string;
  shortDesc: string;
  muscleGroups: string[];
  category: string;
  difficulty: 1 | 2 | 3;
  canProgress: boolean;
  illustrationId: string | null;
  media: ExerciseMedia | null;
  // Video convenience fields (derived from media/video_id)
  hasVideo: boolean;
  videoId: string | null;
}

// ── SESSION DATABASE ─────────────────────────────────────────────────
// Each session: id, title, type, goalTags[], intensity (1-5),
// durationMin, suitableFor[], avoidFor[], equipment[],
// structure[] (ordered blocks), notes (optional)
//
// goalTags: lose | tone | energy | health
// suitableFor: beginner | intermediate | advanced | postpartum | low_stress | low_capacity
// avoidFor: safety tag strings from getSafetyTags (NO_KNEE, NO_BACK_L, etc.)
// equipment: bodyweight | mat | chair | bands | dumbbells_light | dumbbells_medium | dumbbells_heavy | kettlebell
export const SESSIONS: Session[] = [

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
export const EXERCISE_DB: Record<string, ExerciseDBEntry> = {
  'Activare transvers abdominal (TA)':{displayName:'Activare transvers abdominal',en:'Transverse Abdominal Activation',instr:'Contractă mușchii pelvisului, menține 5 sec, relaxează. Respiră normal.'},
  'Band pull apart':{displayName:'Deschidere bandă la piept',en:'Band Pull Apart',instr:'Menține tensiunea constantă în bandă pe toată mișcarea.'},
  'Band pull apart sau towel pull':{displayName:'Deschidere bandă sau prosop',en:'Band Pull Apart / Towel Pull',instr:'Menține tensiunea constantă în bandă pe toată mișcarea.'},
  'Bent over row':{displayName:'Ramat aplecat',en:'Bent Over Row',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bent over row cu bandă':{displayName:'Ramat aplecat cu bandă',en:'Banded Bent Over Row',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bent over row cu gantere':{displayName:'Ramat aplecat cu gantere',en:'Dumbbell Bent Over Row',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bent over row cu sticle':{displayName:'Ramat aplecat cu sticle',en:'Bent Over Row (Bottles)',instr:'Trage greutatea spre piept, coatele aproape de corp. Omoplații se apropie.'},
  'Bicep curl':{displayName:'Flexie de biceps',en:'Bicep Curl',instr:'Menține coatele lipite de corp. Mișcare controlată sus și jos.'},
  'Bicep curl cu bandă':{displayName:'Flexie de biceps cu bandă',en:'Banded Bicep Curl',instr:'Menține coatele lipite de corp. Mișcare controlată sus și jos.'},
  'Bicep curl izometric (perete)':{displayName:'Flexie izometrică de biceps',en:'Isometric Wall Bicep Curl',instr:'Menține coatele lipite de corp. Mișcare controlată sus și jos.'},
  'Bicycle crunch (lent)':{displayName:'Abdomene bicicletă lent',en:'Slow Bicycle Crunch',instr:'Mâinile la ceafă, rotește trunchiul ducând cotul spre genunchiul opus.'},
  'Bird dog':{displayName:'Echilibru mână-picior opus',en:'Bird Dog',instr:'Extinde lent brațul și piciorul opus. Menține echilibrul și spatele drept.'},
  'Bird dog pe genunchi':{displayName:'Echilibru mână-picior pe genunchi',en:'Kneeling Bird Dog',instr:'Extinde lent brațul și piciorul opus. Menține echilibrul și spatele drept.'},
  'Bulgarian split squat (fără greutate)':{displayName:'Genuflexiune bulgară',en:'Bulgarian Split Squat (Bodyweight)',instr:'Piciorul din spate pe scaun, coboară controlat cu trunchiul drept.'},
  'Burpee modificat (fără săritură)':{displayName:'Burpee modificat',en:'Modified Burpee (No Jump)',instr:'Squat, mâinile pe sol, picioarele înapoi, revin, ridică-te.'},
  'Calf raises':{displayName:'Ridicări pe vârfuri',en:'Calf Raises',instr:'Ridică-te pe vârfuri, menține 2 sec, coboară lent.'},
  'Calf raises la perete':{displayName:'Ridicări pe vârfuri la perete',en:'Wall Calf Raises',instr:'Ridică-te pe vârfuri, menține 2 sec, coboară lent.'},
  'Cat-cow':{displayName:'Pisica-vaca',en:'Cat-Cow',instr:'Alternează arcuirea și rotunjirea spatelui, sincronizat cu respirația.'},
  'Cat-cow lent':{displayName:'Pisica-vaca lent',en:'Slow Cat-Cow',instr:'Alternează arcuirea și rotunjirea spatelui, sincronizat cu respirația.'},
  'Cercuri cu brațele':{displayName:'Cercuri cu brațele',en:'Arm Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Cercuri cu șoldurile':{displayName:'Cercuri cu șoldurile',en:'Hip Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Chest fly pe mat':{displayName:'Deschidere de piept pe mat',en:'Floor Chest Fly',instr:'Deschide brațele larg, coboară controlat, adună la piept.'},
  'Child pose':{displayName:'Poziția copilului',en:'Child Pose',instr:'Menține poziția confortabil, respiră adânc. Nu forța.'},
  'Clamshell':{displayName:'Deschidere de șold',en:'Clamshell',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Clamshell pe mat':{displayName:'Deschidere de șold pe mat',en:'Clamshell on Mat',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Cobra stretch':{displayName:'Extensie de cobră',en:'Cobra Stretch',instr:'Ridică trunchiul ușor sprijinit pe mâini, deschide pieptul. Nu forța.'},
  'Curtsy lunge':{displayName:'Fandare încrucișată',en:'Curtsy Lunge',instr:'Pas lung, coboară controlat. Genunchiul din față nu depășește vârful piciorului.'},
  'Dead bug':{displayName:'Extensie alternativă pe spate',en:'Dead Bug',instr:'Menține spatele lipit de sol. Extinde lent și controlat mâna și piciorul opus.'},
  'Dead bug (alternativ)':{displayName:'Extensie alternativă pe spate',en:'Alternating Dead Bug',instr:'Menține spatele lipit de sol. Extinde lent și controlat mâna și piciorul opus.'},
  'Donkey kicks':{displayName:'Ridicare picior din 4 labe',en:'Donkey Kicks',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Downward dog pedal':{displayName:'V inversat cu pedalare',en:'Downward Dog Pedal',instr:'În V inversat, alternează călcâiele spre sol, simte stretching-ul.'},
  'Figure 4 stretch':{displayName:'Întindere în 4',en:'Figure 4 Stretch',instr:'Pune glezna pe genunchiul opus, trage ușor spre piept.'},
  'Fire hydrant':{displayName:'Deschidere laterală din 4 labe',en:'Fire Hydrant',instr:'Mișcare controlată din șold. Menține abdomenul activat.'},
  'Foam roll / stretching liber':{displayName:'Rulare și întindere liberă',en:'Foam Roll / Free Stretch',instr:'Menține poziția confortabil, respiră adânc. Nu forța.'},
  'Genuflexiuni parțiale':{displayName:'Genuflexiuni parțiale',en:'Partial Squats',instr:'Coboară parțial cu spatele drept, împinge din călcâie la ridicare.'},
  'Glute bridge':{displayName:'Punte de fesieri',en:'Glute Bridge',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Glute bridge activare':{displayName:'Punte de fesieri — activare',en:'Glute Bridge Activation',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Glute bridge cu bandă':{displayName:'Punte de fesieri cu bandă',en:'Banded Glute Bridge',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Glute bridge cu pauză':{displayName:'Punte de fesieri cu pauză',en:'Glute Bridge with Pause',instr:'Ridică șoldurile contractând fesierii. Menține 3 sec sus.'},
  'Glute bridge ușor':{displayName:'Punte de fesieri ușoară',en:'Easy Glute Bridge',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Goblet squat':{displayName:'Genuflexiune cu greutate la piept',en:'Goblet Squat',instr:'Ține gantera la piept, coboară în squat profund. Spatele drept.'},
  'Goblet squat (ganteră)':{displayName:'Genuflexiune cu ganteră la piept',en:'Dumbbell Goblet Squat',instr:'Ține gantera la piept, coboară în squat profund. Spatele drept.'},
  'Happy baby':{displayName:'Poziția bebelușului fericit',en:'Happy Baby',instr:'Pe spate, prinde tălpile cu mâinile, balansează ușor.'},
  'Heel slides pe spate':{displayName:'Alunecare călcâie pe spate',en:'Supine Heel Slides',instr:'Pe spate, alunecă călcâiul pe sol alternativ. Abdomenul activat.'},
  'High knees (lent, fără sărituri)':{displayName:'Genunchi sus lent',en:'Slow High Knees (No Jump)',instr:'Ridică genunchii alternativ spre piept, menținând ritmul.'},
  'Hip circles (all fours)':{displayName:'Cercuri de șold din 4 labe',en:'Hip Circles (All Fours)',instr:'Pe patru labe, cercuri cu genunchiul. Menține trunchiul stabil.'},
  'Hip thrust pe mat':{displayName:'Ridicare de șolduri pe mat',en:'Hip Thrust on Mat',instr:'Ridică șoldurile contractând fesierii. Menține abdomenul activat.'},
  'Hip thrust pe scaun':{displayName:'Ridicare de șolduri pe scaun',en:'Hip Thrust (Chair)',instr:'Spatele sprijinit pe scaun, ridică șoldurile contractând fesierii.'},
  'Inchworm':{displayName:'Mersul viermelui',en:'Inchworm',instr:'Pleacă din picioare, mergi cu mâinile până la planșă, revino.'},
  'Inchworm cu push-up':{displayName:'Mersul viermelui cu flotare',en:'Inchworm to Push-up',instr:'Inchworm cu o flotare la capăt, apoi revino în picioare.'},
  'Jumping jacks':{displayName:'Sărituri stea',en:'Jumping Jacks',instr:'Sari deschizând picioarele și brațele simultan. Aterizează moale.'},
  'Jumping jacks (low impact)':{displayName:'Sărituri stea fără impact',en:'Low Impact Jumping Jacks',instr:'Pas lateral cu brațele deasupra, fără săritură.'},
  'Kegel + respirație':{displayName:'Kegel cu respirație',en:'Kegel + Breathing',instr:'Contractă mușchii pelvisului la expirare, relaxează la inspirare.'},
  'Knee to chest stretch':{displayName:'Întindere genunchi la piept',en:'Knee to Chest Stretch',instr:'Pe spate, trage genunchiul spre piept. Menține 20 sec/parte.'},
  'Lateral band walk':{displayName:'Mers lateral cu bandă',en:'Lateral Band Walk',instr:'Banda la genunchi, pași laterali mici, menține tensiunea.'},
  'Lateral lunge':{displayName:'Fandare laterală',en:'Lateral Lunge',instr:'Pas lateral larg, coboară pe un picior, celălalt drept.'},
  'Lateral shuffle (2 pași)':{displayName:'Deplasare laterală rapidă',en:'Lateral Shuffle (2 Steps)',instr:'Pași laterali rapizi, genunchii ușor flexați, greutatea pe vârfuri.'},
  'Lateral step out':{displayName:'Pas lateral cu revenire',en:'Lateral Step Out',instr:'Pas lateral controlat, revino la centru. Menține echilibrul.'},
  'Legs up the wall':{displayName:'Picioare pe perete',en:'Legs Up the Wall',instr:'Întinde-te cu picioarele pe perete 2-5 min. Respiră adânc.'},
  'Marș cu brațe sus':{displayName:'Mers pe loc cu brațe sus',en:'March with Arms Up',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș cu genunchi sus':{displayName:'Mers pe loc cu genunchi sus',en:'March with High Knees',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș cu ridicare genunchi':{displayName:'Mers cu ridicare genunchi',en:'March with Knee Raise',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș cu rotiri brațe':{displayName:'Mers pe loc cu rotiri brațe',en:'March with Arm Circles',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș pe loc':{displayName:'Mers pe loc',en:'March in Place',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș pe loc (ușor)':{displayName:'Mers pe loc ușor',en:'March in Place (Easy)',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Marș pe loc cu ridicare genunchi':{displayName:'Mers pe loc cu genunchi sus',en:'March in Place with Knee Raise',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Mountain climbers (lent)':{displayName:'Alergare în planșă lent',en:'Slow Mountain Climbers',instr:'Adu genunchii alternativ spre piept, menținând corpul drept.'},
  'Mountain climbers lenți':{displayName:'Alergare în planșă lent',en:'Slow Mountain Climbers',instr:'Adu genunchii alternativ spre piept, menținând corpul drept.'},
  'Neck rolls lente':{displayName:'Rotiri lente de gât',en:'Slow Neck Rolls',instr:'Mișcări lente, controlate. Nu forța amplitudinea.'},
  'Overhead press cu bandă':{displayName:'Presă deasupra capului cu bandă',en:'Banded Overhead Press',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Pallof press (cu bandă sau fără)':{displayName:'Presă anti-rotație',en:'Pallof Press',instr:'Împinge brațele în față rezistând rotației trunchiului. Abdomen activat.'},
  'Pelvic tilt':{displayName:'Basculare bazin',en:'Pelvic Tilt',instr:'Pe spate, aplatizează zona lombară pe sol contractând abdomenul.'},
  'Pigeon stretch':{displayName:'Întindere porumbel',en:'Pigeon Stretch',instr:'Un genunchi în față, celălalt picior întins în spate. Relaxează șoldul.'},
  'Planșă':{displayName:'Planșă',en:'Plank',instr:'Corp drept din cap până la călcâie. Abdomen contractat, respiră normal.'},
  'Planșă cu mâinile pe scaun':{displayName:'Planșă pe scaun',en:'Elevated Plank (Chair)',instr:'Corp drept din cap până la călcâie. Abdomen contractat, respiră normal.'},
  'Planșă laterală':{displayName:'Planșă laterală',en:'Side Plank',instr:'Corp drept, sprijin pe antebraț, șoldul ridicat. Abdomen activat.'},
  'Planșă pe antebrațe':{displayName:'Planșă pe antebrațe',en:'Forearm Plank',instr:'Corp drept din cap până la călcâie. Abdomen contractat, respiră normal.'},
  'Planșă pe genunchi':{displayName:'Planșă pe genunchi',en:'Knee Plank',instr:'Corp drept din cap până la genunchi. Abdomen contractat, respiră normal.'},
  'Plimbare pe loc + respirație':{displayName:'Plimbare pe loc cu respirație',en:'Walk in Place + Breathing',instr:'Pași liniștiți pe loc, sincronizează respirația.'},
  'Plimbare ritm alert':{displayName:'Plimbare ritm alert',en:'Brisk Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare ritm moderat':{displayName:'Plimbare ritm moderat',en:'Moderate Pace Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare ritm normal':{displayName:'Plimbare ritm normal',en:'Normal Pace Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare ritm ușor':{displayName:'Plimbare ritm ușor',en:'Easy Pace Walk',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Plimbare răcire':{displayName:'Plimbare de răcire',en:'Cooldown Walk',instr:'Pași liniștiți pentru răcire, scade pulsul treptat.'},
  'Plimbare ușoară pe loc':{displayName:'Plimbare ușoară pe loc',en:'Easy Walk in Place',instr:'Menține un ritm constant, spatele drept, umerii relaxați.'},
  'Push-up (standard sau genunchi)':{displayName:'Flotări standard sau pe genunchi',en:'Push-up (Standard or Knee)',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Push-up la perete':{displayName:'Flotări la perete',en:'Wall Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Push-up pe genunchi':{displayName:'Flotări pe genunchi',en:'Knee Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Push-up pe genunchi (coate lipite)':{displayName:'Flotări pe genunchi priză îngustă',en:'Close-Grip Knee Push-up',instr:'Coboară controlat cu coatele lipite de corp, împinge cu forță înapoi.'},
  'Push-up standard':{displayName:'Flotări standard',en:'Standard Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Quad stretch în picioare':{displayName:'Întindere cvadriceps în picioare',en:'Standing Quad Stretch',instr:'Prinde glezna, trage călcâiul spre fesier. Menține echilibrul.'},
  'RDL cu gantere':{displayName:'Îndreptări românești cu gantere',en:'Dumbbell RDL',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Respirație box (4-4-4-4)':{displayName:'Respirație box',en:'Box Breathing (4-4-4-4)',instr:'Inspiră 4 sec, ține 4 sec, expiră 4 sec, ține 4 sec.'},
  'Respirație diafragmatică':{displayName:'Respirație diafragmatică',en:'Diaphragmatic Breathing',instr:'Inspiră adânc pe nas umflând abdomenul, expiră lent pe gură.'},
  'Reverse lunge':{displayName:'Fandare înapoi',en:'Reverse Lunge',instr:'Pas lung înapoi, coboară controlat. Genunchiul din față la 90°.'},
  'Reverse lunge alternativ':{displayName:'Fandare înapoi alternativă',en:'Alternating Reverse Lunge',instr:'Pas lung înapoi alternativ, coboară controlat.'},
  'Reverse lunge cu ganteră':{displayName:'Fandare înapoi cu gantere',en:'Dumbbell Reverse Lunge',instr:'Pas lung înapoi, coboară controlat. Gantere în mâini.'},
  'Reverse lunge cu sticle':{displayName:'Fandare înapoi cu sticle',en:'Reverse Lunge with Bottles',instr:'Pas lung înapoi, coboară controlat. Sticle ca greutăți.'},
  'Romanian deadlift':{displayName:'Îndreptări românești',en:'Romanian Deadlift',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Romanian deadlift (gantere)':{displayName:'Îndreptări românești cu gantere',en:'Dumbbell Romanian Deadlift',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Romanian deadlift cu gantere':{displayName:'Îndreptări românești cu gantere',en:'Dumbbell Romanian Deadlift',instr:'Coboară greutatea de-a lungul picioarelor, spatele drept.'},
  'Rotiri gleznă':{displayName:'Rotiri de gleznă',en:'Ankle Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri trunchi':{displayName:'Rotiri de trunchi',en:'Trunk Rotations',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri umeri':{displayName:'Rotiri de umeri',en:'Shoulder Rolls',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri umeri cu gantere ușoare':{displayName:'Rotiri de umeri cu gantere',en:'Shoulder Rolls with Light Dumbbells',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Rotiri încheietură + cot':{displayName:'Rotiri încheietură și cot',en:'Wrist + Elbow Circles',instr:'Mișcări lente, controlate, amplitudine completă.'},
  'Savasana cu respirație':{displayName:'Relaxare completă cu respirație',en:'Savasana with Breathing',instr:'Stai întinsă, relaxează fiecare parte a corpului. Respiră adânc.'},
  'Seated forward fold':{displayName:'Întindere înainte din șezut',en:'Seated Forward Fold',instr:'Stai cu picioarele întinse, aplecă-te înainte din șold. Nu forța.'},
  'Seated hamstring stretch':{displayName:'Întindere ischiogambieri din șezut',en:'Seated Hamstring Stretch',instr:'Un picior întins, aplecă-te spre el. Menține 20 sec/parte.'},
  'Shoulder press':{displayName:'Presă de umeri',en:'Shoulder Press',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Shoulder press (gantere)':{displayName:'Presă de umeri cu gantere',en:'Dumbbell Shoulder Press',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Shoulder press cu sticle':{displayName:'Presă de umeri cu sticle',en:'Shoulder Press (Bottles)',instr:'Împinge controlat deasupra capului, fără arcuirea spatelui.'},
  'Shoulder taps la scaun':{displayName:'Atingere umăr alternativ pe scaun',en:'Chair Shoulder Taps',instr:'În planșă pe scaun, atinge umărul opus alternativ. Trunchiul stabil.'},
  'Shoulder taps în picioare':{displayName:'Atingere umăr alternativ',en:'Standing Shoulder Taps',instr:'Atinge umărul opus alternativ, menținând trunchiul stabil.'},
  'Shoulder taps în planșă pe genunchi':{displayName:'Atingere umăr în planșă pe genunchi',en:'Knee Plank Shoulder Taps',instr:'În planșă pe genunchi, atinge umărul opus. Trunchiul stabil.'},
  'Squat':{displayName:'Genuflexiune',en:'Squat',instr:'Coboară cu spatele drept, genunchii în linie cu degetele. Împinge din călcâie.'},
  'Squat bodyweight':{displayName:'Genuflexiune liberă',en:'Bodyweight Squat',instr:'Coboară cu spatele drept, genunchii în linie cu degetele. Împinge din călcâie.'},
  'Squat bodyweight (paralel)':{displayName:'Genuflexiune paralelă',en:'Bodyweight Squat (Parallel)',instr:'Coboară până coapsa e paralelă cu solul. Spatele drept.'},
  'Squat cu bandă':{displayName:'Genuflexiune cu bandă',en:'Banded Squat',instr:'Banda la genunchi, coboară controlat împingând genunchii în afară.'},
  'Squat cu bandă (activare)':{displayName:'Genuflexiune cu bandă — activare',en:'Banded Squat (Activation)',instr:'Banda la genunchi, coboară controlat împingând genunchii în afară.'},
  'Squat cu bandă la genunchi':{displayName:'Genuflexiune cu bandă la genunchi',en:'Banded Squat (Knee)',instr:'Banda la genunchi, coboară controlat împingând genunchii în afară.'},
  'Squat cu gantere':{displayName:'Genuflexiune cu gantere',en:'Dumbbell Squat',instr:'Gantere la umeri, coboară controlat. Spatele drept.'},
  'Squat cu press':{displayName:'Genuflexiune cu presă',en:'Squat to Press',instr:'Squat și la ridicare împinge ganterele deasupra capului.'},
  'Squat cu rotire trunchi':{displayName:'Genuflexiune cu rotire trunchi',en:'Squat with Trunk Rotation',instr:'Squat și rotire trunchi la ridicare. Mișcare controlată.'},
  'Squat cu sticle la piept':{displayName:'Genuflexiune cu sticle la piept',en:'Goblet Squat (Bottles)',instr:'Sticle la piept, coboară în squat profund. Spatele drept.'},
  'Squat la scaun':{displayName:'Genuflexiune la scaun',en:'Box Squat',instr:'Coboară până atingi scaunul, ridică-te din călcâie.'},
  'Squat la scaun (atingere)':{displayName:'Genuflexiune la scaun cu atingere',en:'Box Squat (Touch)',instr:'Coboară până atingi scaunul, ridică-te din călcâie.'},
  'Squat pulsuri':{displayName:'Genuflexiune cu pulsuri',en:'Pulse Squat',instr:'Coboară în squat și pulsează mici mișcări sus-jos.'},
  'Squat taps':{displayName:'Genuflexiune cu atingere laterală',en:'Squat Taps',instr:'Squat cu atingere laterală alternativă a piciorului.'},
  'Squat ușor':{displayName:'Genuflexiune ușoară',en:'Easy Squat',instr:'Coboară parțial, menține spatele drept. Împinge din călcâie.'},
  'Step touch lateral':{displayName:'Pas lateral cu atingere',en:'Lateral Step Touch',instr:'Pas lateral cu atingere, menține ritmul.'},
  'Step-up pe scaun (lent)':{displayName:'Urcare pe scaun lent',en:'Step-up on Chair (Slow)',instr:'Urcă controlat pe scaun, împinge din călcâie. Alternează picioarele.'},
  'Stretching brațe + piept':{displayName:'Întindere brațe și piept',en:'Arm + Chest Stretch',instr:'Menține poziția confortabil, respiră adânc. Nu forța.'},
  'Stretching complet':{displayName:'Întindere completă',en:'Full Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching complet lower body':{displayName:'Întindere completă partea inferioară',en:'Lower Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching complet picioare':{displayName:'Întindere completă picioare',en:'Leg Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching complet upper body':{displayName:'Întindere completă partea superioară',en:'Upper Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching cu bandă':{displayName:'Întindere cu bandă elastică',en:'Band-Assisted Stretch',instr:'Folosește banda pentru a asista stretching-ul. Nu forța.'},
  'Stretching cvadriceps + ischio':{displayName:'Întindere cvadriceps și ischio',en:'Quad + Hamstring Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching cvadriceps în picioare':{displayName:'Întindere cvadriceps în picioare',en:'Standing Quad Stretch',instr:'Prinde glezna, trage călcâiul spre fesier. Menține 20 sec.'},
  'Stretching fesieri + ischio':{displayName:'Întindere fesieri și ischio',en:'Glute + Hamstring Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching gât lateral':{displayName:'Întindere laterală de gât',en:'Lateral Neck Stretch',instr:'Înclină capul lateral ușor. Menține 15 sec/parte.'},
  'Stretching ischiogambieri':{displayName:'Întindere ischiogambieri',en:'Hamstring Stretch',instr:'Piciorul întins, aplecă-te înainte din șold. Menține 20 sec.'},
  'Stretching liber':{displayName:'Întindere liberă',en:'Free Stretch',instr:'Stretching la alegere, concentrează-te pe zonele tensionate.'},
  'Stretching lower body':{displayName:'Întindere partea inferioară',en:'Lower Body Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching piept la perete':{displayName:'Întindere piept la perete',en:'Wall Chest Stretch',instr:'Brațul pe perete la 90°, rotește trunchiul ușor.'},
  'Stretching piept la ușă':{displayName:'Întindere piept la ușă',en:'Doorway Chest Stretch',instr:'Brațele pe cadrul ușii, fă un pas înainte pentru stretch.'},
  'Stretching rapid':{displayName:'Întindere rapidă',en:'Quick Stretch',instr:'Stretch-uri scurte 10-15 sec pe grupele principale.'},
  'Stretching triceps':{displayName:'Întindere triceps',en:'Triceps Stretch',instr:'Brațul deasupra capului, trage cotul cu mâna opusă.'},
  'Stretching triceps + piept':{displayName:'Întindere triceps și piept',en:'Triceps + Chest Stretch',instr:'Menține fiecare poziție 15-20 sec, respiră adânc.'},
  'Stretching ușor':{displayName:'Întindere ușoară',en:'Easy Stretch',instr:'Mișcări blânde de stretching, nu forța amplitudinea.'},
  'Sumo squat cu ganteră':{displayName:'Genuflexiune sumo cu ganteră',en:'Dumbbell Sumo Squat',instr:'Picioare depărtate, vârfuri în afară. Coboară drept, împinge din călcâie.'},
  'Superman':{displayName:'Extensie dorsală',en:'Superman',instr:'Ridică simultan brațele și picioarele de pe sol. Menține 2 sec sus.'},
  'Superman (brațe pe lângă corp)':{displayName:'Extensie dorsală cu brațe lateral',en:'Superman (Arms by Side)',instr:'Ridică trunchiul și picioarele, brațele pe lângă corp.'},
  'Superman alternativ':{displayName:'Extensie dorsală alternativă',en:'Alternating Superman',instr:'Ridică alternativ brațul și piciorul opus. Menține 2 sec.'},
  'Supine twist':{displayName:'Rotire pe spate',en:'Supine Twist',instr:'Pe spate, genunchii într-o parte, privirea în cealaltă. Relaxează.'},
  'Supine twist ușor':{displayName:'Rotire ușoară pe spate',en:'Easy Supine Twist',instr:'Pe spate, genunchii într-o parte, privirea în cealaltă. Relaxează.'},
  'Thread the needle':{displayName:'Rotație pe sub corp',en:'Thread the Needle',instr:'Pe patru labe, strecoară brațul pe sub corp, rotește trunchiul.'},
  'Tricep dip la scaun':{displayName:'Coborâre de triceps pe scaun',en:'Chair Tricep Dip',instr:'Mâinile pe marginea scaunului, coboară controlat flexând coatele.'},
  'Tricep dips pe scaun':{displayName:'Coborâri de triceps pe scaun',en:'Chair Tricep Dips',instr:'Mâinile pe marginea scaunului, coboară controlat flexând coatele.'},
  'Tricep kickback':{displayName:'Extensie de triceps',en:'Tricep Kickback',instr:'Aplecat înainte, extinde brațul înapoi complet. Contractă tricepsul.'},
  'Wall sit':{displayName:'Scaun la perete',en:'Wall Sit',instr:'Spatele lipit de perete, genunchii la 90°. Menține poziția.'},
  'World greatest stretch':{displayName:'Întindere completă dinamică',en:'World\'s Greatest Stretch',instr:'Lunge cu rotire trunchi și extensie braț. Stretch complet.'},
  'Împingeri perete':{displayName:'Flotări la perete',en:'Wall Push-up',instr:'Coboară controlat cu coatele aproape de corp, împinge cu forță înapoi.'},
  'Înclinare push-up la scaun':{displayName:'Flotări înclinate pe scaun',en:'Incline Push-up (Chair)',instr:'Mâinile pe scaun, coboară controlat, împinge înapoi.'},
  'Înclinări laterale':{displayName:'Înclinări laterale',en:'Side Bends',instr:'Înclină trunchiul lateral alternativ, mișcare controlată.'}
};

// ── ENRICH EXERCISE ─────────────────────────────────────────────────
// Merges EXERCISE_DB data into an exercise object.
// Returns enriched copy with all current + future-facing fields normalized.
// Phase 2 will use the normalized fields for multi-week progression.
export function enrichExercise(ex: any): EnrichedExercise | any {
  if (!ex || !ex.name) return ex;
  const db = EXERCISE_DB[ex.name];
  if (!db) return ex;
  return {
    name: ex.name,
    name_en: db.en || ex.name,
    sets: ex.sets,
    reps: ex.reps,
    rest: ex.rest,
    instructions: db.instr || '',
    video_id: db.video_id || null,
    modify_if: db.modify_if || null,
    // Normalized future-facing fields with safe fallbacks
    // displayName: db.displayName (explicit override) → ex.name (Romanian DB key) → db.en (English)
    displayName: db.displayName || ex.name || db.en,
    shortDesc: db.shortDesc || db.instr || '',
    muscleGroups: db.muscleGroups || [],
    category: db.category || 'general',
    difficulty: db.difficulty || 2,
    canProgress: db.canProgress !== undefined ? db.canProgress : true,
    illustrationId: db.illustrationId || null,
    media: db.media || null,
    // Video convenience: resolved from media.canonicalVideoId → legacy video_id
    hasVideo: !!(db.media?.canonicalVideoId || db.video_id),
    videoId: db.media?.canonicalVideoId || db.video_id || null,
  };
}

// ── VIDEO/MEDIA HELPERS ─────────────────────────────────────────────
// Standalone helpers for consumers that don't call enrichExercise().

/** Returns true if the exercise has any video mapping in the DB. */
export function hasExerciseVideo(nameOrEntry: string | ExerciseDBEntry): boolean {
  const db = typeof nameOrEntry === 'string' ? EXERCISE_DB[nameOrEntry] : nameOrEntry;
  if (!db) return false;
  return !!(db.media?.canonicalVideoId || db.video_id);
}

/** Returns the canonical video ID for an exercise, or null. */
export function getExerciseCanonicalVideoId(nameOrEntry: string | ExerciseDBEntry): string | null {
  const db = typeof nameOrEntry === 'string' ? EXERCISE_DB[nameOrEntry] : nameOrEntry;
  if (!db) return null;
  return db.media?.canonicalVideoId || db.video_id || null;
}

/** Returns the poster image ID for an exercise, or null. */
export function getExercisePosterImageId(nameOrEntry: string | ExerciseDBEntry): string | null {
  const db = typeof nameOrEntry === 'string' ? EXERCISE_DB[nameOrEntry] : nameOrEntry;
  if (!db) return null;
  return db.media?.posterImageId || null;
}

/** Builds a watchable video URL from a video ID. Returns null if no ID. */
export function buildExerciseVideoUrl(videoId: string | null | undefined): string | null {
  if (!videoId) return null;
  // YouTube short-link format — works for embeds and direct links
  return `https://youtu.be/${videoId}`;
}

/** Returns a full video URL for an exercise by name, or null. */
export function getExerciseVideoUrl(nameOrEntry: string | ExerciseDBEntry): string | null {
  return buildExerciseVideoUrl(getExerciseCanonicalVideoId(nameOrEntry));
}

// ── PROGRESSION READINESS HELPER ────────────────────────────────────
// Returns whether an exercise supports sets/reps progression across weeks.
// Used by future multi-week plan builders to decide which exercises get
// volume/intensity increases vs stay constant (e.g. stretches, walks).
export function canExerciseProgress(ex: ExerciseDBEntry): boolean {
  if (ex.canProgress !== undefined) return ex.canProgress;
  // Default: progressable unless it's a known non-progressive pattern
  return true;
}

// ── SESSION PROGRESSION NOTES ───────────────────────────────────────
// Phase 2 will add progression overrides per session block. The likely
// integration point is ExerciseBlock.exercises — each Exercise will
// receive optional { setsOverride, repsOverride } from the progression
// layer, leaving the Session/ExerciseBlock interfaces unchanged.
// No runtime changes in this phase.


// ── EXPERIENCE LEVEL MAP ─────────────────────────────────────────────
// Maps q13 → suitableFor tag
export const EXP_MAP: Record<number, string> = {0:'beginner', 1:'beginner', 2:'intermediate', 3:'advanced'};

// ── TIME BUDGET MAP ──────────────────────────────────────────────────
// Maps q8 → max duration minutes
export const TIME_MAP: Record<number, number> = {0:15, 1:20, 2:30, 3:45, 4:60};

// ── EQUIPMENT MAP ────────────────────────────────────────────────────
// Maps q9 indices → session equipment tags
export const EQUIP_MAP: Record<number, string> = {
  0:'bodyweight', 1:'chair', 2:'mat', 3:'bodyweight',
  4:'bands', 5:'dumbbells_light', 6:'dumbbells_medium',
  7:'dumbbells_heavy', 8:'kettlebell', 9:'bodyweight'
};

// ── SAFETY TAG → avoidFor MAPPING ────────────────────────────────────
export const SAFETY_AVOID: string[] = [
  'NO_KNEE','NO_BACK_L','NO_BACK_C','NO_SHOULDER','NO_HIP',
  'NO_DISC','NO_DIASTASIS','NO_STANDING_LONG','NO_POSITION_CHANGE'
];


// ── FILTER SESSIONS ──────────────────────────────────────────────────
// Returns sessions matching user constraints, sorted by id (deterministic).
export function filterSessions(profile: any, ans: any): Session[] {
  profile = profile || {}; ans = ans || {};

  // Resolve experience level
  const exp = ans.q13 !== undefined ? ans.q13 : 0;
  const level = EXP_MAP[exp] || 'beginner';

  // Resolve time budget
  const timeIdx = ans.q8 !== undefined ? ans.q8 : 2;
  const maxDuration = TIME_MAP[timeIdx] || 30;

  // Resolve user equipment
  const userEquipRaw = ans.q9 || [0]; // default: bodyweight only
  const userEquip: Record<string, boolean> = {};
  userEquip['bodyweight'] = true; // always available
  userEquip['mat'] = true;        // assume mat always available
  for (let i = 0; i < userEquipRaw.length; i++) {
    const eq = EQUIP_MAP[userEquipRaw[i]];
    if (eq) userEquip[eq] = true;
  }

  // Resolve safety tags to build avoidSet
  let safetyTags: any[] = [];
  try { safetyTags = getSafetyTags(profile, ans); } catch(e) { /* ignore if not loaded */ }
  const avoidSet: Record<string, boolean> = {};
  for (let t = 0; t < safetyTags.length; t++) {
    if (safetyTags[t].type === 'exclude') {
      avoidSet[safetyTags[t].tag] = true;
    }
  }

  // Postpartum flag
  const isPostpartum = profile.moment === 0;

  // Stress/capacity indicators
  const stress = ans.q6 !== undefined ? ans.q6 : 1;
  const sleep = ans.q5 !== undefined ? ans.q5 : 1;
  const isLowCapacity = (stress >= 2 && sleep >= 2) || stress >= 3;

  const filtered: Session[] = [];
  for (let j = 0; j < SESSIONS.length; j++) {
    const s = SESSIONS[j];

    // Duration filter
    if (s.durationMin > maxDuration) continue;

    // Equipment filter: all required equipment must be available
    let equipOk = true;
    for (let k = 0; k < s.equipment.length; k++) {
      if (!userEquip[s.equipment[k]]) { equipOk = false; break; }
    }
    if (!equipOk) continue;

    // Safety: skip sessions whose avoidFor tags match user's safety exclusions
    let safetyOk = true;
    for (let a = 0; a < s.avoidFor.length; a++) {
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
export function resolveFrequency(profile: any, ans: any): number {
  ans = ans || {}; profile = profile || {};
  const activity = profile.activity !== undefined ? profile.activity : 0;
  const stress = ans.q6 !== undefined ? ans.q6 : 1;
  const sleep = ans.q5 !== undefined ? ans.q5 : 1;
  const time = ans.q8 !== undefined ? ans.q8 : 2;

  // Base frequency from activity level
  let freq: number;
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
export function resolveWeeklyGoal(profile: any, ans: any, frequency: number): string {
  const goal = profile.goal !== undefined ? profile.goal : 3;
  const stress = ans.q6 !== undefined ? ans.q6 : 1;

  if (profile.moment === 0) return 'Reconectare cu corpul — mișcare blândă, sigură postpartum';
  if (profile.moment === 4) return 'Mișcare ca terapie — fără presiune, fără cronometru';
  if (stress >= 3 || profile.moment === 3) return 'Reducerea stresului prin mișcare — zero presiune';

  if (goal === 0) return 'Ardere calorică + tonifiere — ' + frequency + ' sesiuni/săptămână';
  if (goal === 1) return 'Tonifiere și forță — ' + frequency + ' sesiuni/săptămână';
  if (goal === 2) return 'Energie și vitalitate — ' + frequency + ' sesiuni/săptămână';
  return 'Sănătate generală și echilibru — ' + frequency + ' sesiuni/săptămână';
}


// ── SESSION TYPE PRIORITY BY GOAL ────────────────────────────────────
export const GOAL_TYPE_PRIORITY: Record<number, string[]> = {
  0: ['full_body_medium','full_body_light','lower_body','walking','low_impact_home','upper_body','mobility','recovery','postpartum_safe'],
  1: ['full_body_medium','lower_body','upper_body','full_body_light','low_impact_home','mobility','walking','recovery','postpartum_safe'],
  2: ['full_body_light','walking','mobility','low_impact_home','full_body_medium','recovery','lower_body','upper_body','postpartum_safe'],
  3: ['full_body_light','mobility','walking','recovery','low_impact_home','full_body_medium','lower_body','upper_body','postpartum_safe']
};

// Postpartum priority
export const PP_TYPE_PRIORITY: string[] = ['postpartum_safe','mobility','walking','recovery','full_body_light','low_impact_home'];

// Low capacity priority
export const LOW_CAP_PRIORITY: string[] = ['mobility','walking','recovery','full_body_light','low_impact_home','postpartum_safe'];


// ── BUILD TRAINING PLAN ──────────────────────────────────────────────
// Returns a deterministic weekly training plan.
// Output: { weeklyGoal, frequency, sessions[], totalMinutes }
export function buildTrainingPlan(profile: any, ans: any): {
  weeklyGoal: string;
  frequency: number;
  sessions: Session[];
  totalMinutes: number;
} {
  profile = profile || {}; ans = ans || {};

  const frequency = resolveFrequency(profile, ans);
  const weeklyGoal = resolveWeeklyGoal(profile, ans, frequency);

  let available = filterSessions(profile, ans);

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
  const isPostpartum = profile.moment === 0;
  const stress = ans.q6 !== undefined ? ans.q6 : 1;
  const sleep = ans.q5 !== undefined ? ans.q5 : 1;
  const isLowCapacity = (stress >= 2 && sleep >= 2) || stress >= 3;

  let typePriority: string[];
  if (isPostpartum) {
    typePriority = PP_TYPE_PRIORITY;
  } else if (isLowCapacity) {
    typePriority = LOW_CAP_PRIORITY;
  } else {
    const goal = profile.goal !== undefined ? profile.goal : 3;
    typePriority = GOAL_TYPE_PRIORITY[goal] || GOAL_TYPE_PRIORITY[3];
  }

  // Build session list: pick top sessions by type priority, no duplicates
  const selected: Session[] = [];
  const usedIds: Record<string, boolean> = {};
  const usedTypes: Record<string, boolean> = {};

  // Ensure variety: always include recovery/mobility for freq >= 3
  const needRecovery = (frequency >= 3);

  for (let p = 0; p < typePriority.length && selected.length < frequency; p++) {
    const targetType = typePriority[p];

    // Find best matching session of this type
    for (let s = 0; s < available.length; s++) {
      if (selected.length >= frequency) break;
      const sess = available[s];
      if (usedIds[sess.id]) continue;
      if (sess.type !== targetType) continue;

      // Goal tag match bonus: prefer sessions matching user goal
      const goalTag = ['lose','tone','energy','health'][profile.goal || 3];
      const hasGoalTag = sess.goalTags.indexOf(goalTag) !== -1;

      // Pick it
      usedIds[sess.id] = true;
      usedTypes[targetType] = true;
      selected.push(sess);
      break; // one per type per pass
    }
  }

  // If still not enough sessions, fill from available (by id order, skip used)
  for (let f = 0; f < available.length && selected.length < frequency; f++) {
    if (!usedIds[available[f].id]) {
      usedIds[available[f].id] = true;
      selected.push(available[f]);
    }
  }

  // If frequency >= 3 and no recovery/mobility selected, swap last session
  if (needRecovery && selected.length >= 3) {
    let hasRecovery = false;
    for (let r = 0; r < selected.length; r++) {
      if (selected[r].type === 'mobility' || selected[r].type === 'recovery' || selected[r].type === 'walking') {
        hasRecovery = true; break;
      }
    }
    if (!hasRecovery) {
      // Find a recovery/mobility session from available
      for (let m = 0; m < available.length; m++) {
        const ms = available[m];
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
  let totalMinutes = 0;
  for (let tm = 0; tm < selected.length; tm++) {
    totalMinutes += selected[tm].durationMin;
  }

  return {
    weeklyGoal: weeklyGoal,
    frequency: frequency,
    sessions: selected,
    totalMinutes: totalMinutes
  };
}

// =============================================================================
// 4-WEEK TRAINING PLAN — Additive multi-week progression (Phase 2)
// Built on top of buildTrainingPlan(). Does NOT replace it.
// Consumers: future /program page, automated delivery in webhook.
// =============================================================================

// ── 4-Week Types ────────────────────────────────────────────────────

export interface TrainingPlanWeek {
  weekIndex: 1 | 2 | 3 | 4;
  label: string;
  focus: string;
  sessions: Session[];
  totalMinutes: number;
}

export interface TrainingPlan4Weeks {
  weeklyGoal: string;
  frequency: number;
  totalWeeks: 4;
  weeks: TrainingPlanWeek[];
  totalMinutes: number;
}

// ── Week metadata ───────────────────────────────────────────────────

const WEEK_META: { label: string; focus: string }[] = [
  { label: 'Săptămâna 1 — Bază',                focus: 'Construim fundația. Învață mișcările, respectă pauzele, concentrează-te pe formă.' },
  { label: 'Săptămâna 2 — Creștere ușoară',      focus: 'Volumul crește ușor. Adăugăm repetări sau secunde — corpul tău e deja mai pregătit.' },
  { label: 'Săptămâna 3 — Creștere controlată',  focus: 'Cel mai intens punct al planului. Împinge-te puțin peste zona de confort — controlat.' },
  { label: 'Săptămâna 4 — Consolidare',          focus: 'Volum redus, calitate maximă. Corpul se recuperează și fixează progresul.' },
];

// ── Progression constants ───────────────────────────────────────────
// Week deltas are intentionally small and conservative.
// Week 1 = base, Week 2 = +1 step, Week 3 = +2 steps, Week 4 = -1 from base (deload)

interface ProgressionRule {
  setsAdd: number;
  repsAdd: number;
  holdSecondsAdd: number;
}

const WEEK_RULES: ProgressionRule[] = [
  { setsAdd: 0, repsAdd: 0, holdSecondsAdd: 0 },   // Week 1: base
  { setsAdd: 0, repsAdd: 2, holdSecondsAdd: 5 },    // Week 2: +2 reps or +5 sec
  { setsAdd: 1, repsAdd: 2, holdSecondsAdd: 5 },    // Week 3: +1 set, +2 reps or +5 sec
  { setsAdd: 0, repsAdd: -2, holdSecondsAdd: -5 },  // Week 4: deload — slightly below base
];

// ── Block classification ────────────────────────────────────────────
// Warm-up and cool-down blocks never progress.
const NON_PROGRESSIVE_BLOCKS = ['Încălzire', 'Răcire'];

function _isProgressiveBlock(blockName: string): boolean {
  return !NON_PROGRESSIVE_BLOCKS.includes(blockName);
}

// ── Prescription parsing ────────────────────────────────────────────
// Parses common rep/hold formats into a structured representation.
// Returns null if the format is unrecognized (exercise stays unchanged).

interface ParsedReps {
  type: 'count' | 'count_per_side' | 'count_per_dir' | 'seconds' | 'seconds_per_side' | 'seconds_per_group' | 'minutes' | 'cycles' | 'breaths';
  value: number;
  suffix: string;      // e.g. '/parte', '/direcție', ' sec', ' min'
  holdNote: string;     // e.g. '(2 sec pauză sus)', '(3 sec hold)'
}

function _parseReps(reps: string): ParsedReps | null {
  const s = reps.trim();

  // "10 (2 sec pauză sus)" or "8 (5 sec hold)" — count with hold note
  let m = s.match(/^(\d+)\s*(\([^)]+\))$/);
  if (m) return { type: 'count', value: parseInt(m[1]), suffix: '', holdNote: ' ' + m[2] };

  // "8/parte", "10/parte", "12/parte"
  m = s.match(/^(\d+)\/parte$/);
  if (m) return { type: 'count_per_side', value: parseInt(m[1]), suffix: '/parte', holdNote: '' };

  // "10/direcție", "8/direcție", "5/direcție"
  m = s.match(/^(\d+)\/direcție$/);
  if (m) return { type: 'count_per_dir', value: parseInt(m[1]), suffix: '/direcție', holdNote: '' };

  // "30 sec/parte", "20 sec/parte", "15 sec/parte"
  m = s.match(/^(\d+)\s*sec\/parte$/);
  if (m) return { type: 'seconds_per_side', value: parseInt(m[1]), suffix: ' sec/parte', holdNote: '' };

  // "30 sec/grupă", "20 sec/grupă"
  m = s.match(/^(\d+)\s*sec\/grupă$/);
  if (m) return { type: 'seconds_per_group', value: parseInt(m[1]), suffix: ' sec/grupă', holdNote: '' };

  // "15 sec hold"
  m = s.match(/^(\d+)\s*sec\s+hold$/);
  if (m) return { type: 'seconds', value: parseInt(m[1]), suffix: ' sec hold', holdNote: '' };

  // "60 sec", "30 sec", "20 sec", "15 sec"
  m = s.match(/^(\d+)\s*sec$/);
  if (m) return { type: 'seconds', value: parseInt(m[1]), suffix: ' sec', holdNote: '' };

  // "2 min", "3 min", "5 min", "4 min", "10 min"
  m = s.match(/^(\d+)\s*min$/);
  if (m) return { type: 'minutes', value: parseInt(m[1]), suffix: ' min', holdNote: '' };

  // "8 cicluri", "5 cicluri"
  m = s.match(/^(\d+)\s*cicluri$/);
  if (m) return { type: 'cycles', value: parseInt(m[1]), suffix: ' cicluri', holdNote: '' };

  // "5 respirații", "8 respirații"
  m = s.match(/^(\d+)\s*respirații$/);
  if (m) return { type: 'breaths', value: parseInt(m[1]), suffix: ' respirații', holdNote: '' };

  // Plain count: "10", "12", "15", "8", "5"
  m = s.match(/^(\d+)$/);
  if (m) return { type: 'count', value: parseInt(m[1]), suffix: '', holdNote: '' };

  // Unrecognized format — return null (exercise stays unchanged)
  return null;
}

function _formatReps(parsed: ParsedReps, newValue: number): string {
  // Ensure value stays positive and reasonable
  const v = Math.max(newValue, 1);
  return v + parsed.suffix + parsed.holdNote;
}

// ── Exercise cloning + progression ──────────────────────────────────

function _cloneExercise(ex: Exercise): Exercise {
  return { name: ex.name, sets: ex.sets, reps: ex.reps, rest: ex.rest };
}

function _progressExercise(ex: Exercise, rule: ProgressionRule): Exercise {
  const clone = _cloneExercise(ex);

  // Check if this exercise can progress via EXERCISE_DB
  const db = EXERCISE_DB[ex.name];
  if (db && !canExerciseProgress(db)) return clone;

  const parsed = _parseReps(ex.reps);
  if (!parsed) return clone; // Unrecognized format — keep unchanged

  // Apply sets progression (only for count-based exercises, not time-based warm-ups)
  if (rule.setsAdd !== 0 && parsed.type === 'count' || parsed.type === 'count_per_side' || parsed.type === 'count_per_dir' || parsed.type === 'cycles') {
    clone.sets = Math.max(ex.sets + rule.setsAdd, 1);
  }

  // Apply reps/hold progression based on type
  switch (parsed.type) {
    case 'count':
    case 'count_per_side':
    case 'count_per_dir':
    case 'cycles':
      clone.reps = _formatReps(parsed, parsed.value + rule.repsAdd);
      break;
    case 'seconds':
    case 'seconds_per_side':
    case 'seconds_per_group':
      clone.reps = _formatReps(parsed, parsed.value + rule.holdSecondsAdd);
      break;
    case 'minutes':
    case 'breaths':
      // Don't progress minutes or breathing exercises — keep as-is
      break;
  }

  return clone;
}

// ── Session cloning + week building ─────────────────────────────────

function _cloneExerciseBlock(block: ExerciseBlock, rule: ProgressionRule): ExerciseBlock {
  const progressive = _isProgressiveBlock(block.block);
  return {
    block: block.block,
    duration: block.duration,
    exercises: block.exercises.map(function(ex) {
      return progressive ? _progressExercise(ex, rule) : _cloneExercise(ex);
    }),
  };
}

function _cloneSession(session: Session, rule: ProgressionRule): Session {
  return {
    id: session.id,
    title: session.title,
    type: session.type,
    goalTags: session.goalTags.slice(),
    intensity: session.intensity,
    durationMin: session.durationMin,
    suitableFor: session.suitableFor.slice(),
    avoidFor: session.avoidFor.slice(),
    equipment: session.equipment.slice(),
    structure: session.structure.map(function(block) {
      return _cloneExerciseBlock(block, rule);
    }),
    notes: session.notes,
  };
}

// ── 4-Week Plan Builder ─────────────────────────────────────────────
// Uses buildTrainingPlan() for session selection (week 1 base),
// then applies conservative progression rules for weeks 2-4.

export function buildTrainingPlan4Weeks(profile: any, ans: any): TrainingPlan4Weeks {
  // Get the base weekly plan (session selection logic unchanged)
  const base = buildTrainingPlan(profile, ans);

  const weeks: TrainingPlanWeek[] = [];
  let grandTotalMinutes = 0;

  for (let w = 0; w < 4; w++) {
    const rule = WEEK_RULES[w];
    const meta = WEEK_META[w];

    const weekSessions = base.sessions.map(function(session) {
      return _cloneSession(session, rule);
    });

    let weekMinutes = 0;
    for (let s = 0; s < weekSessions.length; s++) {
      weekMinutes += weekSessions[s].durationMin;
    }

    weeks.push({
      weekIndex: (w + 1) as 1 | 2 | 3 | 4,
      label: meta.label,
      focus: meta.focus,
      sessions: weekSessions,
      totalMinutes: weekMinutes,
    });

    grandTotalMinutes += weekMinutes;
  }

  return {
    weeklyGoal: base.weeklyGoal,
    frequency: base.frequency,
    totalWeeks: 4,
    weeks: weeks,
    totalMinutes: grandTotalMinutes,
  };
}
