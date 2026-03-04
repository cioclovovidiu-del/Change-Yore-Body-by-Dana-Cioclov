import type { Question } from "./questionnaire.types";

export const QUESTIONS: Question[] = [
  { id:'welcome', type:'welcome' },

  // BLOC 1: DESPRE TINE
  { id:'q1', type:'text', block:'Despre Tine', icon:'🌸', num:'1', title:'Cum te numești?', sub:'Prenumele tău (așa cum vrei să ți mă adresez)', ph:'Scrie prenumele tău...', req:true },
  { id:'q2', type:'number', block:'Despre Tine', icon:'🌸', num:'2', title:'Câți ani ai?', sub:'Vârsta ta în ani', ph:'ex: 38', req:true },
  { id:'q3', type:'number', block:'Despre Tine', icon:'🌸', num:'3', title:'Cât de înaltă ești? (cm)', sub:'Exemplu: 165', ph:'165', req:true },
  { id:'q4', type:'number', block:'Despre Tine', icon:'🌸', num:'4', title:'Cât cântărești acum? (kg)', sub:'Greutatea ta actuală — fii sinceră, e doar pentru calcul', ph:'72', req:true },
  { id:'q5', type:'single', block:'Despre Tine', icon:'🌸', num:'5', title:'Care este obiectivul tău principal?', sub:null, req:true,
    opts:['Slăbire / pierdere în greutate','Tonifiere / dezvoltare masă musculară','Menținere greutate + stil de viață sănătos','Recuperare post-partum','Echilibrare hormonală (pre-menopauză / menopauză)'] },
  { id:'q6', type:'single', block:'Despre Tine', icon:'🌸', num:'6', title:'În ce etapă de viață te afli?', sub:null, req:true,
    opts:['Sub 35 de ani — ciclu menstrual regulat','35-45 ani — ciclu regulat','Pre-menopauză (cicluri neregulate, primele simptome)','Menopauză (fără menstruație de peste 12 luni)','Post-partum (0-12 luni după naștere)','Alăptez în prezent'] },

  // RAMIFICARE: Pre-menopauză / Menopauză
  { id:'q7', type:'multi', block:'Despre Tine', icon:'🌸', num:'7', title:'Ce simptome hormonale experimentezi cel mai des?', sub:'Bifează tot ce se aplică', req:true,
    opts:['Bufeuri / valuri de căldură','Insomnie / somn agitat','Schimbări de dispoziție','Creștere în greutate (mai ales abdominal)','Oboseală cronică','Libido scăzut','Dureri articulare','Altele'],
    showIf:{q:'q6',vals:[2,3]} },
  { id:'q8', type:'single', block:'Despre Tine', icon:'🌸', num:'8', title:'Urmezi tratament hormonal substitutiv (HRT)?', sub:null, req:true,
    opts:['Da, prescris de medic','Nu','Am urmat în trecut, dar am renunțat','Sunt în discuții cu medicul'],
    showIf:{q:'q6',vals:[2,3]} },

  // RAMIFICARE: Post-partum / Alăptez
  { id:'q9', type:'number', block:'Despre Tine', icon:'🌸', num:'9', title:'Câte luni au trecut de la naștere?', sub:null, ph:'ex: 4', req:true,
    showIf:{q:'q6',vals:[4,5]} },
  { id:'q10', type:'single', block:'Despre Tine', icon:'🌸', num:'10', title:'Cum ai născut?', sub:null, req:true,
    opts:['Natural','Cezariană'],
    showIf:{q:'q6',vals:[4,5]} },
  { id:'q11', type:'single', block:'Despre Tine', icon:'🌸', num:'11', title:'Alăptezi în prezent?', sub:null, req:true,
    opts:['Da, exclusiv','Da, parțial (și formulă)','Nu'],
    showIf:{q:'q6',vals:[4,5]} },
  { id:'q12', type:'multi', block:'Despre Tine', icon:'🌸', num:'12', title:'Bifează ce se aplică:', sub:'Important pentru siguranța ta', req:true,
    opts:['Am primit aviz medical să fac sport','Am diastază abdominală (confirmată sau suspectată)','Am incontinență urinară (pierderi la efort/tuse/râs)','Nimic din cele de mai sus'],
    showIf:{q:'q6',vals:[4,5]} },

  // BLOC 2: STILUL TĂU DE VIAȚĂ
  { id:'q13', type:'single', block:'Stilul Tău de Viață', icon:'☀️', num:'13', title:'Cum ai dormit ÎN ULTIMA LUNĂ?', sub:null, req:true,
    opts:['Bine (7-8h, somn odihnitor)','Ok, dar m-aș odihni mai bine','Prost (sub 6h sau treziri frecvente)','Foarte prost (insomnie / anxietate nocturnă)'] },
  { id:'q14', type:'single', block:'Stilul Tău de Viață', icon:'☀️', num:'14', title:'Nivelul tău de stres zilnic?', sub:null, req:true,
    opts:['Scăzut — viața e ok','Moderat — stres normal de zi cu zi','Ridicat — mă simt copleșită frecvent','Foarte ridicat — mă afectează fizic'] },
  { id:'q15', type:'single', block:'Stilul Tău de Viață', icon:'☀️', num:'15', title:'Cum arată o zi obișnuită pentru tine?', sub:null, req:true,
    opts:['Lucrez de acasă (remote / freelancer)','Lucrez la birou (8+ ore așezată)','Lucrez în picioare / mișcare (vânzătoare, asistentă etc.)','Sunt mamă cu program complet acasă','Lucrez ture','Program mixt / variabil'] },
  { id:'q16', type:'single', block:'Stilul Tău de Viață', icon:'☀️', num:'16', title:'Cât de activă ești în prezent?', sub:null, req:true,
    opts:['Sedentară (birou, mașină, canapea)','Ușor activă (mers pe jos ocazional)','Moderat activă (mișcare regulată, 2-3x/săpt.)','Foarte activă (sport zilnic sau muncă fizică)'] },
  { id:'q17', type:'single', block:'Stilul Tău de Viață', icon:'☀️', num:'17', title:'Ai mai făcut antrenamente acasă?', sub:null, req:true,
    opts:['Nu, niciodată','Am încercat dar am renunțat','Da, ocazional','Da, regulat'] },
  { id:'q18', type:'single', block:'Stilul Tău de Viață', icon:'☀️', num:'18', title:'Cât timp ai pe zi pentru antrenament?', sub:null, req:true,
    opts:['Sub 15 minute','15-20 minute','20-30 minute','30-45 minute','Peste 45 minute'] },
  { id:'q19', type:'multi', block:'Stilul Tău de Viață', icon:'☀️', num:'19', title:'Ce ai disponibil pentru antrenament?', sub:'Bifează tot ce ai — inclusiv obiecte din casă!', req:true,
    opts:['Doar corpul meu (zero echipament)','Scaun stabil + canapea','Saltea / covorășel','Sticle de apă (ca greutăți)','Benzi elastice — ușoare','Benzi elastice — medii','Benzi elastice — grele','Gantere mici (1-3 kg)','Gantere medii (4-6 kg)','Gantere mari (7+ kg)','Kettlebell','Bicicletă staționară / bandă alergat'] },

  // BLOC 3: SĂNĂTATE & LIMITĂRI
  { id:'q20', type:'multi', block:'Sănătate & Limitări', icon:'🏥', num:'20', title:'Ai condiții medicale sau iei medicamente?', sub:'Confidențial — necesare pentru siguranța ta', req:true,
    opts:['Nu am nicio condiție și nu iau medicamente','Diabet tip 2 / Pre-diabet / Rezistență la insulină','Hipotiroidism (Hashimoto sau alt tip)','PCOS (Sindromul ovarelor polichistice)','Hipertensiune arterială','Probleme cardiace','Depresie / Anxietate (diagnosticată)'] },
  { id:'q21', type:'textarea', block:'Sănătate & Limitări', icon:'🏥', num:'21', title:'Medicamente / detalii suplimentare:', sub:'Scrie ce medicamente iei și orice altceva relevant.\nDacă nu iei nimic, scrie "Nu iau medicamente."', ph:'ex: Euthyrox 50mg, sau "Nu iau medicamente"', req:true },
  { id:'q22', type:'multi', block:'Sănătate & Limitări', icon:'🏥', num:'22', title:'Ai limitări fizice sau dureri?', sub:'Foarte important! Adaptăm fiecare exercițiu.', req:true,
    opts:['Nu am nicio limitare','Dureri de genunchi','Dureri de spate (lombară)','Dureri de spate (cervicală / gât)','Probleme la umăr','Probleme la încheietura mâinii','Probleme la șold','Hernie de disc','Incontinență urinară','Diastază abdominală','Varice / probleme circulatorii','Vertij la schimbări de poziție','Altceva'] },
  { id:'q23', type:'single', block:'Sănătate & Limitări', icon:'🏥', num:'23', title:'Nivelul tău de experiență cu sportul?', sub:null, req:true,
    opts:['Începător total — nu am făcut sport niciodată / de foarte mult timp','Începător — am făcut puțin dar nu consistent','Intermediar — fac sport ocazional, știu exercițiile de bază','Avansat — fac sport regulat și am experiență'] },

  // BLOC 4: ALIMENTAȚIA TA
  { id:'q24', type:'single', block:'Alimentația Ta', icon:'🥗', num:'24', title:'Câte mese mănânci pe zi?', sub:null, req:true,
    opts:['1-2 mese (sar peste mese)','3 mese principale','3 mese + 1-2 gustări','Mănânc când apuc, fără ritm fix'] },
  { id:'q25', type:'single', block:'Alimentația Ta', icon:'🥗', num:'25', title:'Micul dejun?', sub:null, req:true,
    opts:['Da, în fiecare zi','Uneori','Aproape niciodată'] },
  { id:'q26', type:'single', block:'Alimentația Ta', icon:'🥗', num:'26', title:'Mănânci emoțional?', sub:'Stres, tristețe, plictiseală', req:true,
    opts:['Da, des — e o problemă reală','Uneori, când sunt stresată','Rar / Nu'] },
  { id:'q27', type:'single', block:'Alimentația Ta', icon:'🥗', num:'27', title:'Câtă apă bei pe zi?', sub:null, req:true,
    opts:['Sub 0.5 litri','0.5-1 litru','1-1.5 litri','1.5-2 litri','Peste 2 litri'] },
  { id:'q28', type:'single', block:'Alimentația Ta', icon:'🥗', num:'28', title:'Ai mai ținut diete înainte?', sub:null, req:true,
    opts:['Nu, niciodată','Da, 1-2 diete','Da, câteva (2-3 în ultimii ani)','Da, multe (am tot încercat)','Sunt mereu la o dietă sau alta'] },
  { id:'q29', type:'multi', block:'Alimentația Ta', icon:'🥗', num:'29', title:'Ce tip de dietă ai mai urmat?', sub:'Bifează tot ce se aplică', req:false,
    opts:['Keto / Low carb','Dietă cu deficit caloric','Intermittent fasting','Post negru / diete drastice','Diete din reviste / online','Nutriționist / dietetician'],
    showIf:{q:'q28',vals:[1,2,3,4]} },
  { id:'q30', type:'single', block:'Alimentația Ta', icon:'🥗', num:'30', title:'Urmezi un tip de alimentație?', sub:null, req:true,
    opts:['Nu — mănânc de toate','Vegetariană','Vegană','Pescetariană','Fără gluten','Fără lactoză'] },
  { id:'q31', type:'multi', block:'Alimentația Ta', icon:'🥗', num:'31', title:'Alergii sau intoleranțe?', sub:null, req:true,
    opts:['Nu am','Lactoză','Gluten','Nuci / arahide','Ouă','Pește / fructe de mare'] },
  { id:'q32', type:'textarea', block:'Alimentația Ta', icon:'🥗', num:'32', title:'Ce alimente NU mănânci sau eviți?', sub:'Scrie orice nu-ți place sau eviți: tipuri de carne, legume, fructe, lactate etc.\nDacă mănânci de toate, scrie: Nimic de evitat.', ph:'ex: nu mănânc porc, nu-mi plac vinetele și ciupercile, evit broccoli', req:true },
  { id:'q33', type:'single', block:'Alimentația Ta', icon:'🥗', num:'33', title:'Ce complexitate preferi la rețete?', sub:null, req:true,
    opts:['Foarte simplu — max 15-20 min, puține ingrediente','Mediu — pot găti 30-40 min','Meal prep (gătesc o dată, mănânc mai multe zile)','Mix — simple în timpul săptămânii, elaborate în weekend'] },
  { id:'q34', type:'multi', block:'Alimentația Ta', icon:'🥗', num:'34', title:'Ce metode de gătit folosești?', sub:null, req:true,
    opts:['La tigaie (stir-fry, soté)','La cuptor','Fiert / la abur','Air fryer','Slow cooker / multicooker','Nu gătesc — rețete fără gătit'] },
  { id:'q35', type:'single', block:'Alimentația Ta', icon:'🥗', num:'35', title:'Buget săptămânal mâncare (pentru tine)?', sub:null, req:true,
    opts:['Sub 150 RON','150-250 RON','250-400 RON','Peste 400 RON'] },

  // BLOC 5: MOTIVAȚIE
  { id:'q36', type:'multi', block:'Motivație', icon:'💪', num:'36', title:'Care este cel mai mare obstacol?', sub:'Poți bifa mai multe', req:true,
    opts:['Lipsa de timp','Lipsa de motivație / disciplină','Nu știu ce să mănânc','Poftele / mâncatul emoțional','Lipsa de suport din familie','Stresul','Nu văd rezultate destul de repede','Costurile mâncării sănătoase'] },
  { id:'q37', type:'scale', block:'Motivație', icon:'💪', num:'37', title:'Cât de motivată ești ACUM? (1-10)', sub:null, min:1, max:10, minLabel:'Curioasă', maxLabel:'Extrem de motivată', req:true },

  // BLOC 6: CONTACT + GDPR
  { id:'q38', type:'email', block:'Contact', icon:'📧', num:'38', title:'Care e adresa ta de email?', sub:'Aici vei primi raportul tău personalizat', ph:'email@exemplu.ro', req:true },
  { id:'q39', type:'tel', block:'Contact', icon:'📧', num:'39', title:'Număr WhatsApp (opțional)', sub:'Doar dacă vrei să comunicăm și pe WhatsApp', ph:'+40 7xx xxx xxx', req:false },
  { id:'q40', type:'gdpr', block:'Contact', icon:'🔒', num:'40', title:'Acord GDPR și confidențialitate', sub:null, req:true,
    opts:['Da, sunt de acord','Nu sunt de acord'] },

  { id:'end', type:'end' },
  { id:'declined', type:'declined' }
];;
