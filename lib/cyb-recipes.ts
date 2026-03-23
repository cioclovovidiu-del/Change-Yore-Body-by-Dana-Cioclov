// =============================================================================
// CYB RECIPES — Recipe Database + Deterministic Meal Planner (TS module)
// Extracted from: public/landing-v2/CYB_Recipes.js
// Pure data + logic only — no DOM, no HTML formatters.
// =============================================================================

import { calcBMR, calcTDEE } from "./cyb-calc";

// ── RECIPE INTERFACE ────────────────────────────────────────────────
export interface Recipe {
  id: string;
  title: string;
  mealType: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: string[];
  exclusions: string[];
  prepMin: number;
  servings: number;
  budget: string;
  ingredients: string[];
  instructions: string;
}

// ── MEAL SLOTS ───────────────────────────────────────────────────────
export const MEAL_SLOTS = ['breakfast','lunch','dinner','snack1','snack2'];

// ── RECIPE DATABASE ──────────────────────────────────────────────────
// Tags: traditional, mediterranean, simple, asian, vegetarian, quick
// Exclusions: diabetes, hypothyroid, pcos, hypertension, breastfeeding
// mealType: breakfast | lunch | dinner | snack
export const RECIPES: Recipe[] = [

  // ═══════════════════════════════════════════════════════════════════
  // BREAKFAST (20 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'b01', title:'Omletă cu legume și brânză', mealType:'breakfast',
   kcal:320, protein:22, carbs:12, fat:20,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ouă','ardei','roșii','brânză','ulei de măsline'],
   instructions:'Bate ouăle, adaugă legumele tăiate mărunt, coace pe ambele părți. Presară brânza rasă deasupra.'},

  {id:'b02', title:'Ovăz cu banană și scorțișoară', mealType:'breakfast',
   kcal:350, protein:10, carbs:55, fat:8,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:8, servings:1, budget:'low',
   ingredients:['fulgi de ovăz','banană','scorțișoară','lapte','miere'],
   instructions:'Fierbe ovăzul în lapte 5 min, adaugă banana tăiată și scorțișoara. Opțional: miere deasupra.'},

  {id:'b03', title:'Iaurt grecesc cu nuci și fructe de pădure', mealType:'breakfast',
   kcal:280, protein:18, carbs:22, fat:14,
   tags:['mediterranean','simple','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['iaurt grecesc','nuci','afine','zmeură','miere'],
   instructions:'Pune iaurtul în bol, adaugă nucile, fructele de pădure și un fir de miere.'},

  {id:'b04', title:'Pâine integrală cu avocado și ou poșat', mealType:'breakfast',
   kcal:380, protein:16, carbs:30, fat:22,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:12, servings:1, budget:'medium',
   ingredients:['pâine integrală','avocado','ou','lămâie','sare'],
   instructions:'Prăjește pâinea, zdrobește avocado cu lămâie, pune oul poșat deasupra.'},

  {id:'b05', title:'Clătite proteice cu iaurt', mealType:'breakfast',
   kcal:340, protein:28, carbs:35, fat:8,
   tags:['simple','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'low',
   ingredients:['ovăz','ou','iaurt','banană','ulei de cocos'],
   instructions:'Mixează ovăzul cu oul, iaurtul și banana. Coace pe ambele părți ca o clătită.'},

  {id:'b06', title:'Budincă de chia cu lapte de cocos', mealType:'breakfast',
   kcal:290, protein:8, carbs:28, fat:16,
   tags:['vegetarian','mediterranean'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['semințe de chia','lapte de cocos','miere','vanilie','fructe'],
   instructions:'Amestecă semințele de chia cu laptele de cocos, lasă la frigider peste noapte. Servește cu fructe.'},

  {id:'b07', title:'Sandwich cald cu șuncă și cașcaval', mealType:'breakfast',
   kcal:380, protein:22, carbs:32, fat:18,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:8, servings:1, budget:'low',
   ingredients:['pâine integrală','șuncă presată','cașcaval','roșii','unt'],
   instructions:'Unge pâinea cu unt, adaugă șunca și cașcavalul, prăjește în tigaie sau sandwich maker.'},

  {id:'b08', title:'Smoothie verde cu spanac și banană', mealType:'breakfast',
   kcal:250, protein:8, carbs:40, fat:6,
   tags:['vegetarian','simple','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['spanac','banană','lapte','semințe de in','miere'],
   instructions:'Mixează spanacul, banana, laptele și semințele de in până devine cremos.'},

  {id:'b09', title:'Ouă fierte cu pâine și roșii', mealType:'breakfast',
   kcal:300, protein:18, carbs:28, fat:14,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ouă','pâine integrală','roșii','unt','sare'],
   instructions:'Fierbe ouăle 8-10 min. Servește cu pâine integrală și roșii feliate.'},

  {id:'b10', title:'Tartine cu hummus și legume', mealType:'breakfast',
   kcal:310, protein:12, carbs:38, fat:12,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:8, servings:1, budget:'low',
   ingredients:['pâine integrală','hummus','castraveți','ardei','semințe'],
   instructions:'Întinde hummus pe pâinea integrală, adaugă legumele feliate și presară semințe.'},

  {id:'b11', title:'Mămăligă cu brânză și smântână', mealType:'breakfast',
   kcal:360, protein:14, carbs:40, fat:16,
   tags:['traditional'], exclusions:[],
   prepMin:20, servings:1, budget:'low',
   ingredients:['mălai','brânză de vaci','smântână','unt','sare'],
   instructions:'Fierbe mămăliga 20 min amestecând constant. Servește cu brânză și smântână.'},

  {id:'b12', title:'Granola cu iaurt și fructe', mealType:'breakfast',
   kcal:370, protein:14, carbs:48, fat:14,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['granola','iaurt','căpșuni','miere','semințe de floarea-soarelui'],
   instructions:'Pune granola în bol, adaugă iaurtul, fructele și mierea.'},

  {id:'b13', title:'Porridge cu mere și nuci', mealType:'breakfast',
   kcal:340, protein:10, carbs:50, fat:12,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['fulgi de ovăz','mere','nuci','scorțișoară','lapte'],
   instructions:'Fierbe ovăzul în lapte, adaugă merele rase și nucile. Condimentează cu scorțișoară.'},

  {id:'b14', title:'Wrap cu ou și avocado', mealType:'breakfast',
   kcal:390, protein:18, carbs:30, fat:24,
   tags:['mediterranean','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['tortilla integrală','ou','avocado','spanac','roșii'],
   instructions:'Prăjește oul, pune în tortilla cu avocado, spanac și roșii. Rulează.'},

  {id:'b15', title:'Brânză de vaci cu roșii și semințe', mealType:'breakfast',
   kcal:260, protein:20, carbs:14, fat:14,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['brânză de vaci','roșii','semințe de dovleac','ulei de măsline','sare'],
   instructions:'Pune brânza de vaci pe farfurie, adaugă roșiile feliate, semințele și un fir de ulei.'},

  {id:'b16', title:'Orez cu lapte și scorțișoară', mealType:'breakfast',
   kcal:330, protein:8, carbs:56, fat:8,
   tags:['traditional','simple'], exclusions:[],
   prepMin:20, servings:1, budget:'low',
   ingredients:['orez','lapte','scorțișoară','zahăr','vanilie'],
   instructions:'Fierbe orezul în lapte la foc mic 20 min cu scorțișoară și vanilie.'},

  {id:'b17', title:'Toast cu ricotta și miere', mealType:'breakfast',
   kcal:300, protein:14, carbs:34, fat:12,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['pâine integrală','ricotta','miere','nuci','scorțișoară'],
   instructions:'Prăjește pâinea, întinde ricotta, adaugă nuci și miere, presară scorțișoară.'},

  {id:'b18', title:'Omletă cu ciuperci și spanac', mealType:'breakfast',
   kcal:280, protein:20, carbs:8, fat:18,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ouă','ciuperci','spanac','ulei de măsline','sare'],
   instructions:'Călește ciupercile și spanacul, adaugă ouăle bătute. Coace pe ambele părți.'},

  {id:'b19', title:'Supă de ovăz cu ou (ciorba de zdrențe)', mealType:'breakfast',
   kcal:290, protein:14, carbs:34, fat:10,
   tags:['traditional'], exclusions:[],
   prepMin:15, servings:1, budget:'low',
   ingredients:['fulgi de ovăz','ou','supă de legume','lămâie','pătrunjel'],
   instructions:'Fierbe supa, adaugă ovăzul și oul bătut. Condimentează cu lămâie și pătrunjel.'},

  {id:'b20', title:'Tofu scramble cu legume (vegan)', mealType:'breakfast',
   kcal:270, protein:18, carbs:16, fat:14,
   tags:['vegetarian','asian'], exclusions:[],
   prepMin:12, servings:1, budget:'medium',
   ingredients:['tofu','ardei','ceapă','turmeric','spanac'],
   instructions:'Sfărâmă tofu în tigaie, adaugă legumele și turmericul. Prăjește 8-10 min.'},

  // ═══════════════════════════════════════════════════════════════════
  // LUNCH (25 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'l01', title:'Piept de pui la grătar cu salată', mealType:'lunch',
   kcal:420, protein:38, carbs:18, fat:22,
   tags:['simple','mediterranean'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['piept de pui','mix salată','roșii','castraveți','ulei de măsline'],
   instructions:'Grătarează pieptul de pui 6-7 min pe parte. Servește pe pat de salată cu legume.'},

  {id:'l02', title:'Ciorbă de legume cu smântână', mealType:'lunch',
   kcal:280, protein:10, carbs:32, fat:12,
   tags:['traditional','simple'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['morcov','cartofi','fasole verde','roșii','smântână'],
   instructions:'Călește legumele, adaugă apă și fierbe 25 min. La final pune smântână.'},

  {id:'l03', title:'Bowl cu quinoa, năut și legume', mealType:'lunch',
   kcal:450, protein:18, carbs:55, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['quinoa','năut','avocado','roșii cherry','lămâie'],
   instructions:'Fierbe quinoa, amestecă cu năutul, avocado și legumele. Dresează cu lămâie.'},

  {id:'l04', title:'Sarmale în foi de viță cu mămăligă', mealType:'lunch',
   kcal:520, protein:24, carbs:42, fat:28,
   tags:['traditional'], exclusions:[],
   prepMin:90, servings:4, budget:'low',
   ingredients:['carne tocată','orez','foi de viță','ceapă','mălai'],
   instructions:'Amestecă carnea cu orezul, rulează în foi de viță, fierbe la foc mic 2 ore.'},

  {id:'l05', title:'Paste integrale cu sos de roșii și pui', mealType:'lunch',
   kcal:460, protein:32, carbs:50, fat:14,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:20, servings:1, budget:'low',
   ingredients:['paste integrale','piept de pui','roșii pasate','usturoi','busuioc'],
   instructions:'Fierbe pastele, prăjește puiul tăiat, adaugă sosul de roșii cu usturoi și busuioc.'},

  {id:'l06', title:'Salată de ton cu fasole și legume', mealType:'lunch',
   kcal:380, protein:30, carbs:28, fat:16,
   tags:['mediterranean','simple','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['ton conservat','fasole','ceapă roșie','porumb','lămâie'],
   instructions:'Scurge tonul, amestecă cu fasolea, ceapa și porumbul. Dresează cu lămâie.'},

  {id:'l07', title:'Supă cremă de broccoli', mealType:'lunch',
   kcal:260, protein:12, carbs:24, fat:14,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['broccoli','cartof','ceapă','smântână','sare'],
   instructions:'Fierbe broccoli cu cartoful, mixează fin. Adaugă smântână și condimentează.'},

  {id:'l08', title:'Pilaf de orez cu legume și pui', mealType:'lunch',
   kcal:480, protein:28, carbs:52, fat:16,
   tags:['traditional','simple'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['orez','piept de pui','morcov','mazăre','ardei'],
   instructions:'Călește puiul tăiat cuburi, adaugă legumele și orezul, fierbe acoperit 20 min.'},

  {id:'l09', title:'Wrap cu pui, hummus și legume', mealType:'lunch',
   kcal:420, protein:28, carbs:36, fat:18,
   tags:['mediterranean','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['tortilla integrală','pui','hummus','salată','roșii'],
   instructions:'Întinde hummus pe tortilla, adaugă puiul fărâmițat, salata și roșiile. Rulează.'},

  {id:'l10', title:'Ghiveci de legume', mealType:'lunch',
   kcal:320, protein:10, carbs:42, fat:12,
   tags:['traditional','vegetarian'], exclusions:[],
   prepMin:40, servings:3, budget:'low',
   ingredients:['vinete','ardei','dovlecei','roșii','cartofi'],
   instructions:'Taie legumele, pune în tavă cu ulei, coace la cuptor 40 min amestecând ocazional.'},

  {id:'l11', title:'Curry de linte cu orez', mealType:'lunch',
   kcal:440, protein:20, carbs:58, fat:12,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['linte roșie','lapte de cocos','curry','orez','spanac'],
   instructions:'Călește ceapa, adaugă lintea, laptele de cocos și curry. Fierbe 25 min. Servește cu orez.'},

  {id:'l12', title:'Tocăniță de pui cu cartofi', mealType:'lunch',
   kcal:460, protein:30, carbs:38, fat:20,
   tags:['traditional'], exclusions:[],
   prepMin:40, servings:2, budget:'low',
   ingredients:['pui','cartofi','ceapă','roșii','boia'],
   instructions:'Călește puiul cu ceapa și cartofii, adaugă roșiile și boia, fierbe la foc mic 30 min.'},

  {id:'l13', title:'Salată Caesar cu pui', mealType:'lunch',
   kcal:400, protein:32, carbs:18, fat:24,
   tags:['simple','mediterranean'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['piept de pui','salată romană','parmezan','crutoane','dressing'],
   instructions:'Grătarează puiul, servește pe salată romană cu parmezan, crutoane și dressing.'},

  {id:'l14', title:'Supă cremă de dovleac', mealType:'lunch',
   kcal:240, protein:6, carbs:32, fat:10,
   tags:['vegetarian','simple'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['dovleac','cartof','ceapă','smântână','semințe de dovleac'],
   instructions:'Călește ceapa, adaugă dovleacul și cartoful, fierbe și mixează. Servește cu smântână.'},

  {id:'l15', title:'Pui teriyaki cu orez și broccoli', mealType:'lunch',
   kcal:470, protein:34, carbs:48, fat:14,
   tags:['asian'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['piept de pui','sos soia','miere','ghimbir','orez','broccoli'],
   instructions:'Marinează puiul în sos soia și miere, prăjește cu ghimbir. Servește cu orez și broccoli.'},

  {id:'l16', title:'Chiftele de curcan cu piure', mealType:'lunch',
   kcal:440, protein:28, carbs:36, fat:20,
   tags:['traditional','simple'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['curcan tocat','ou','pesmet','cartofi','unt'],
   instructions:'Amestecă curcanul cu oul și pesmetul, formează chiftele, coace 25 min. Servește cu piure.'},

  {id:'l17', title:'Salată cu halloumi la grătar', mealType:'lunch',
   kcal:400, protein:22, carbs:20, fat:26,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['halloumi','mix salată','ardei','roșii','ulei de măsline'],
   instructions:'Prăjește feliile de halloumi, servește pe salată cu legume și ulei de măsline.'},

  {id:'l18', title:'Ciorbă de perișoare', mealType:'lunch',
   kcal:340, protein:20, carbs:28, fat:16,
   tags:['traditional'], exclusions:[],
   prepMin:40, servings:3, budget:'low',
   ingredients:['carne tocată','orez','morcov','leuștean','borș'],
   instructions:'Formează perișoarele din carne și orez, fierbe în ciorbă cu legume și borș 35 min.'},

  {id:'l19', title:'Buddha bowl cu edamame', mealType:'lunch',
   kcal:430, protein:22, carbs:48, fat:16,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['orez brun','edamame','avocado','morcov','sos soia'],
   instructions:'Fierbe orezul brun, aranjează cu edamame, avocado și morcov. Dresează cu sos soia.'},

  {id:'l20', title:'Mușchi de porc cu legume la cuptor', mealType:'lunch',
   kcal:440, protein:34, carbs:24, fat:24,
   tags:['traditional'], exclusions:[],
   prepMin:45, servings:2, budget:'medium',
   ingredients:['mușchi de porc','cartofi dulci','dovlecei','ceapă','rozmarin'],
   instructions:'Condimentează mușchiul, pune în tavă cu legumele. Coace la 180°C, 40 min.'},

  {id:'l21', title:'Paste cu pesto și roșii cherry', mealType:'lunch',
   kcal:420, protein:14, carbs:50, fat:18,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:12, servings:1, budget:'medium',
   ingredients:['paste integrale','pesto','roșii cherry','parmezan','busuioc'],
   instructions:'Fierbe pastele, amestecă cu pesto și roșiile cherry. Presară parmezan și busuioc.'},

  {id:'l22', title:'Fasole bătută cu ceapă călită', mealType:'lunch',
   kcal:350, protein:16, carbs:46, fat:10,
   tags:['traditional','vegetarian'], exclusions:[],
   prepMin:60, servings:3, budget:'low',
   ingredients:['fasole','ceapă','ulei de floarea-soarelui','boia','sare'],
   instructions:'Fierbe fasolea până e moale, zdrobește cu furculița. Călește ceapa și adaugă peste.'},

  {id:'l23', title:'Salată de linte cu legume', mealType:'lunch',
   kcal:360, protein:18, carbs:44, fat:10,
   tags:['mediterranean','vegetarian','simple'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['linte verde','roșii','castraveți','ceapă roșie','lămâie'],
   instructions:'Fierbe lintea 20 min, răcește, amestecă cu legumele tăiate. Dresează cu lămâie.'},

  {id:'l24', title:'Stir-fry de legume cu tofu', mealType:'lunch',
   kcal:350, protein:20, carbs:30, fat:16,
   tags:['asian','vegetarian','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['tofu','broccoli','ardei','morcov','sos soia'],
   instructions:'Prăjește tofu în cuburi, adaugă legumele tăiate, sosul soia. Amestecă 5-7 min.'},

  {id:'l25', title:'Supă de pui cu tăiței', mealType:'lunch',
   kcal:320, protein:24, carbs:30, fat:10,
   tags:['traditional','simple'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['pui','tăiței','morcov','țelină','pătrunjel'],
   instructions:'Fierbe puiul cu legumele 25 min, adaugă tăițeii și fierbe încă 8 min.'},

  // ═══════════════════════════════════════════════════════════════════
  // DINNER (25 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'d01', title:'Somon la cuptor cu legume', mealType:'dinner',
   kcal:420, protein:34, carbs:18, fat:24,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:25, servings:1, budget:'high',
   ingredients:['somon','sparanghel','lămâie','usturoi','ulei de măsline'],
   instructions:'Condimentează somonul, pune în tavă cu sparanghelul. Coace la 200°C, 20 min.'},

  {id:'d02', title:'Piept de pui cu cartofi dulci', mealType:'dinner',
   kcal:440, protein:36, carbs:38, fat:14,
   tags:['simple'], exclusions:[],
   prepMin:30, servings:1, budget:'medium',
   ingredients:['piept de pui','cartofi dulci','broccoli','ulei de măsline','condimente'],
   instructions:'Coace pieptul de pui cu cartofii dulci și broccoli la cuptor, 25-30 min.'},

  {id:'d03', title:'Salată caldă cu quinoa și legume la grătar', mealType:'dinner',
   kcal:380, protein:16, carbs:42, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['quinoa','dovlecei','ardei','vinete','feta'],
   instructions:'Fierbe quinoa, grătarează legumele. Amestecă și adaugă feta sfărâmată.'},

  {id:'d04', title:'Supă cremă de linte roșie', mealType:'dinner',
   kcal:310, protein:16, carbs:40, fat:8,
   tags:['simple','vegetarian','asian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['linte roșie','morcov','ceapă','turmeric','lămâie'],
   instructions:'Călește ceapa, adaugă lintea și morcovul, fierbe 20 min. Mixează și adaugă lămâie.'},

  {id:'d05', title:'Pui cu legume în stil asiatic', mealType:'dinner',
   kcal:400, protein:30, carbs:32, fat:16,
   tags:['asian','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['piept de pui','broccoli','ardei','sos soia','ghimbir'],
   instructions:'Taie puiul fâșii, prăjește cu legumele, adaugă sos soia și ghimbir.'},

  {id:'d06', title:'Paste cu somon afumat și smântână', mealType:'dinner',
   kcal:480, protein:26, carbs:46, fat:20,
   tags:['mediterranean'], exclusions:[],
   prepMin:15, servings:1, budget:'high',
   ingredients:['paste integrale','somon afumat','smântână','mărar','lămâie'],
   instructions:'Fierbe pastele, amestecă cu somonul afumat, smântâna și mărarul.'},

  {id:'d07', title:'Ciorbă de fasole cu afumătură', mealType:'dinner',
   kcal:380, protein:18, carbs:40, fat:16,
   tags:['traditional'], exclusions:[],
   prepMin:50, servings:3, budget:'low',
   ingredients:['fasole','afumătură','ceapă','morcov','borș'],
   instructions:'Fierbe fasolea cu afumătura și legumele, acrește cu borș. Fierbe 40 min.'},

  {id:'d08', title:'Omletă spaniolă (tortilla de cartofi)', mealType:'dinner',
   kcal:350, protein:18, carbs:28, fat:18,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['ouă','cartofi','ceapă','ulei de măsline','sare'],
   instructions:'Prăjește cartofii cuburi, adaugă ouăle bătute, coace pe ambele părți.'},

  {id:'d09', title:'Curry de năut cu spanac', mealType:'dinner',
   kcal:390, protein:16, carbs:44, fat:16,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['năut','spanac','roșii','lapte de cocos','curry'],
   instructions:'Călește ceapa, adaugă năutul, spanacul, roșiile și laptele de cocos. Fierbe 20 min.'},

  {id:'d10', title:'File de cod cu piure de conopidă', mealType:'dinner',
   kcal:340, protein:30, carbs:20, fat:16,
   tags:['simple','mediterranean'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['cod','conopidă','unt','usturoi','lămâie'],
   instructions:'Coace codul cu lămâie și usturoi. Fierbe conopida, zdrobește cu unt.'},

  {id:'d11', title:'Ardei umpluți cu orez și carne', mealType:'dinner',
   kcal:420, protein:22, carbs:38, fat:20,
   tags:['traditional'], exclusions:[],
   prepMin:50, servings:3, budget:'low',
   ingredients:['ardei','carne tocată','orez','roșii','smântână'],
   instructions:'Umple ardeii cu amestecul de carne și orez, pune sos de roșii, coace 45 min.'},

  {id:'d12', title:'Salată nicoise cu ton', mealType:'dinner',
   kcal:380, protein:28, carbs:22, fat:20,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['ton','ouă fierte','cartofi','fasole verde','măsline'],
   instructions:'Fierbe cartofii și ouăle, aranjează cu tonul, fasole verde și măsline.'},

  {id:'d13', title:'Tocăniță de ciuperci cu mămăligă', mealType:'dinner',
   kcal:360, protein:12, carbs:42, fat:16,
   tags:['traditional','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['ciuperci','ceapă','roșii','boia','mălai'],
   instructions:'Călește ciupercile cu ceapa și boia, fierbe mămăliga separat. Servește împreună.'},

  {id:'d14', title:'Wrap cu falafel și salată', mealType:'dinner',
   kcal:400, protein:14, carbs:44, fat:18,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['năut','condimente','salată','roșii','sos tahini'],
   instructions:'Formează bilele de falafel din năut, prăjește sau coace. Pune în wrap cu salată.'},

  {id:'d15', title:'Pui la cuptor cu legume de sezon', mealType:'dinner',
   kcal:430, protein:34, carbs:24, fat:22,
   tags:['traditional','simple'], exclusions:[],
   prepMin:40, servings:2, budget:'low',
   ingredients:['pulpe de pui','cartofi','morcov','ceapă','rozmarin'],
   instructions:'Condimentează puiul, pune în tavă cu legumele. Coace la 180°C, 35-40 min.'},

  {id:'d16', title:'Orez prăjit cu legume și ou', mealType:'dinner',
   kcal:380, protein:14, carbs:48, fat:14,
   tags:['asian','vegetarian','quick'], exclusions:[],
   prepMin:12, servings:1, budget:'low',
   ingredients:['orez','ou','mazăre','morcov','sos soia'],
   instructions:'Prăjește ouăle scrambled, adaugă orezul fiert și legumele cu sos soia.'},

  {id:'d17', title:'Supă minestrone', mealType:'dinner',
   kcal:280, protein:10, carbs:36, fat:10,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['fasole','paste mici','morcov','țelină','roșii'],
   instructions:'Călește legumele, adaugă fasolea, pastele și apă. Fierbe 25 min.'},

  {id:'d18', title:'Plăcintă cu brânză și spanac', mealType:'dinner',
   kcal:400, protein:18, carbs:34, fat:22,
   tags:['traditional'], exclusions:[],
   prepMin:40, servings:3, budget:'low',
   ingredients:['foi de plăcintă','brânză','spanac','ouă','unt'],
   instructions:'Amestecă brânza cu spanacul și ouăle. Umple foile, coace 35 min la 180°C.'},

  {id:'d19', title:'Shakshuka (ouă în sos de roșii)', mealType:'dinner',
   kcal:320, protein:18, carbs:22, fat:18,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'low',
   ingredients:['ouă','roșii','ardei','ceapă','condimente'],
   instructions:'Călește ceapa și ardeiul, adaugă roșiile, fă gropițe, sparge ouăle. Coace 8 min.'},

  {id:'d20', title:'Paste cu vinete și ricotta', mealType:'dinner',
   kcal:420, protein:16, carbs:50, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['paste integrale','vinete','ricotta','roșii','busuioc'],
   instructions:'Coace vinetele, fierbe pastele. Amestecă cu ricotta, roșii și busuioc.'},

  {id:'d21', title:'Pui cu susan și legume (asian style)', mealType:'dinner',
   kcal:410, protein:32, carbs:28, fat:18,
   tags:['asian'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['piept de pui','susan','broccoli','ardei','sos soia'],
   instructions:'Prăjește puiul cu susan, adaugă broccoli și ardei. Dresează cu sos soia.'},

  {id:'d22', title:'Cartofi copți cu brânză și ceapă verde', mealType:'dinner',
   kcal:380, protein:14, carbs:46, fat:16,
   tags:['traditional','simple','vegetarian'], exclusions:[],
   prepMin:45, servings:2, budget:'low',
   ingredients:['cartofi','brânză de vaci','smântână','ceapă verde','mărar'],
   instructions:'Coace cartofii 40 min, taie la jumătate, adaugă brânza, smântâna și ceapa verde.'},

  {id:'d23', title:'Ratatouille cu ou la cuptor', mealType:'dinner',
   kcal:320, protein:14, carbs:28, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['vinete','dovlecei','ardei','roșii','ouă'],
   instructions:'Aranjează legumele feliate în tavă, adaugă roșii, coace 30 min. Sparge ouăle deasupra.'},

  {id:'d24', title:'Supă miso cu tofu și alge', mealType:'dinner',
   kcal:200, protein:12, carbs:18, fat:8,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['pastă miso','tofu','alge nori','ceapă verde','ghimbir'],
   instructions:'Încălzește apa, dizolvă pasta miso, adaugă tofu în cuburi și algele.'},

  {id:'d25', title:'Musaca de vinete', mealType:'dinner',
   kcal:440, protein:22, carbs:30, fat:26,
   tags:['traditional'], exclusions:[],
   prepMin:60, servings:4, budget:'low',
   ingredients:['vinete','carne tocată','roșii','sos béchamel','cașcaval'],
   instructions:'Prăjește vinetele, fă sos de carne, stratifică. Adaugă béchamel și coace 40 min.'},

  // ═══════════════════════════════════════════════════════════════════
  // SNACKS (20 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'s01', title:'Măr cu unt de arahide', mealType:'snack',
   kcal:200, protein:6, carbs:24, fat:10,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['măr','unt de arahide'],
   instructions:'Taie mărul felii și servește cu unt de arahide pentru dipping.'},

  {id:'s02', title:'Iaurt cu semințe de in', mealType:'snack',
   kcal:150, protein:10, carbs:12, fat:6,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['iaurt','semințe de in'],
   instructions:'Pune iaurtul în bol, presară semințele de in deasupra.'},

  {id:'s03', title:'Mix de nuci și fructe uscate', mealType:'snack',
   kcal:220, protein:6, carbs:22, fat:14,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:1, servings:1, budget:'medium',
   ingredients:['nuci','migdale','stafide','caise uscate'],
   instructions:'Amestecă nucile, migdalele, stafidele și caisele uscate într-un bol.'},

  {id:'s04', title:'Hummus cu bețișoare de legume', mealType:'snack',
   kcal:180, protein:8, carbs:20, fat:8,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['hummus','morcov','castravete','ardei'],
   instructions:'Servește hummusul cu bețișoare de morcov, castravete și ardei.'},

  {id:'s05', title:'Brânză de vaci cu roșii cherry', mealType:'snack',
   kcal:140, protein:14, carbs:6, fat:6,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['brânză de vaci','roșii cherry','sare'],
   instructions:'Pune brânza de vaci pe farfurie, adaugă roșiile cherry tăiate.'},

  {id:'s06', title:'Banană cu iaurt grecesc', mealType:'snack',
   kcal:180, protein:10, carbs:28, fat:4,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['banană','iaurt grecesc'],
   instructions:'Taie banana rondele, servește cu iaurt grecesc.'},

  {id:'s07', title:'Ou fiert cu sare și pâine', mealType:'snack',
   kcal:170, protein:12, carbs:14, fat:8,
   tags:['simple','traditional','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ou','pâine integrală','sare'],
   instructions:'Fierbe oul 8 min, curăță și servește cu pâine integrală.'},

  {id:'s08', title:'Smoothie cu fructe și iaurt', mealType:'snack',
   kcal:200, protein:8, carbs:32, fat:4,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['banană','căpșuni','iaurt','miere'],
   instructions:'Mixează toate fructele cu iaurtul și mierea.'},

  {id:'s09', title:'Edamame cu sare de mare', mealType:'snack',
   kcal:160, protein:14, carbs:10, fat:6,
   tags:['asian','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['edamame','sare de mare'],
   instructions:'Fierbe edamame 5 min, scurge și presară sare de mare.'},

  {id:'s10', title:'Biscuiți de ovăz cu banană', mealType:'snack',
   kcal:180, protein:4, carbs:30, fat:6,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:20, servings:6, budget:'low',
   ingredients:['fulgi de ovăz','banană','miere','scorțișoară'],
   instructions:'Zdrobește banana, amestecă cu ovăzul și mierea, coace 15 min la 180°C.'},

  {id:'s11', title:'Tartină cu avocado', mealType:'snack',
   kcal:200, protein:4, carbs:18, fat:14,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:3, servings:1, budget:'medium',
   ingredients:['pâine integrală','avocado','lămâie','sare'],
   instructions:'Zdrobește avocado pe pâinea prăjită, stoarce lămâie și presară sare.'},

  {id:'s12', title:'Morcovi copți cu miere și semințe', mealType:'snack',
   kcal:150, protein:4, carbs:22, fat:6,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:20, servings:2, budget:'low',
   ingredients:['morcov','miere','semințe de susan','ulei de măsline'],
   instructions:'Taie morcovii, amestecă cu miere și ulei, coace 15-20 min. Presară susan.'},

  {id:'s13', title:'Bruschetă cu roșii și busuioc', mealType:'snack',
   kcal:170, protein:4, carbs:22, fat:8,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['pâine','roșii','busuioc','usturoi','ulei de măsline'],
   instructions:'Prăjește pâinea, freacă cu usturoi, adaugă roșii tăiate și busuioc.'},

  {id:'s14', title:'Covrigei cu hummus', mealType:'snack',
   kcal:190, protein:6, carbs:28, fat:6,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['covrigei','hummus'],
   instructions:'Servește covrigeii cu hummus.'},

  {id:'s15', title:'Cașcaval cu struguri', mealType:'snack',
   kcal:200, protein:10, carbs:16, fat:12,
   tags:['simple','traditional','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'medium',
   ingredients:['cașcaval','struguri'],
   instructions:'Taie cașcavalul cuburi și servește cu strugurii.'},

  {id:'s16', title:'Bile energizante cu curmale', mealType:'snack',
   kcal:180, protein:4, carbs:26, fat:8,
   tags:['vegetarian','simple'], exclusions:[],
   prepMin:10, servings:4, budget:'low',
   ingredients:['curmale','nuci','cacao','cocos'],
   instructions:'Mixează curmalele cu nucile și cacaua. Formează bile, dă prin cocos.'},

  {id:'s17', title:'Salată de fructe proaspete', mealType:'snack',
   kcal:120, protein:2, carbs:28, fat:1,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['mere','banane','portocale','kiwi'],
   instructions:'Taie fructele cuburi mici și amestecă într-un bol.'},

  {id:'s18', title:'Ardei mini umpluți cu brânză', mealType:'snack',
   kcal:160, protein:10, carbs:8, fat:10,
   tags:['mediterranean','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['ardei mini','brânză cremă','mărar'],
   instructions:'Umple ardeii mini cu brânză cremă, presară mărar.'},

  {id:'s19', title:'Pâine cu ricotta și miere', mealType:'snack',
   kcal:190, protein:8, carbs:24, fat:6,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:3, servings:1, budget:'medium',
   ingredients:['pâine integrală','ricotta','miere'],
   instructions:'Întinde ricotta pe pâinea prăjită, adaugă un fir de miere.'},

  {id:'s20', title:'Chips de kale', mealType:'snack',
   kcal:100, protein:4, carbs:12, fat:4,
   tags:['vegetarian','simple'], exclusions:[],
   prepMin:15, servings:2, budget:'low',
   ingredients:['kale','ulei de măsline','sare','usturoi praf'],
   instructions:'Rupe frunzele de kale, unge cu ulei, coace 10-12 min la 180°C.'}
];

// ── BUDGET MAP ───────────────────────────────────────────────────────
// Maps q19 answer index → max budget tier
export const BUDGET_MAP: Record<number, string> = {0:'low', 1:'medium', 2:'high', 3:'high'};

// ── FOOD PREF MAP ────────────────────────────────────────────────────
// Maps q18 answer indices → recipe tag names
export const PREF_TAG_MAP: Record<number, string | null> = {
  0: 'traditional',
  1: 'mediterranean',
  2: 'simple',
  3: 'asian',
  4: 'vegetarian',
  5: null           // "mănânc orice" → no filter
};

// ── BUDGET TIER ORDERING ─────────────────────────────────────────────
export const BUDGET_TIERS: Record<string, number> = {low:0, medium:1, high:2};

// ── ALLERGY INGREDIENT MAP (q19b) ───────────────────────────────────
// Maps q19b answer index → ingredient keywords to exclude
export const ALLERGY_KEYWORDS: Record<number, string[]> = {
  0: ['lapte','brânză','cașcaval','smântână','iaurt','unt','ricotta','parmezan','halloumi','brânză de vaci','lapte de'],  // Lactoză / Lactate
  1: ['pâine','paste','tortilla','crutoane','pesmet','fulgi de ovăz','ovăz','mălai','granola'],  // Gluten
  2: ['nuci','arahide','migdale','caju','alune'],  // Nuci / Arahide
  3: ['ou','ouă'],  // Ouă
  4: ['ton','somon','pește','sardine','hering','fructe de mare','creveți'],  // Pește / Fructe de mare
  5: ['soia','sos soia','tofu','edamame'],  // Soia
  // 6 = "Nu am alergii" → no filter
};

// ── PREP TIME MAP (q19c) ────────────────────────────────────────────
// Maps q19c answer index → max prepMin
export const PREP_TIME_MAP: Record<number, number> = {0:15, 1:30, 2:45, 3:999, 4:10};  // last: "nu gătesc" → only very quick/no-cook

// ── FILTER RECIPES ───────────────────────────────────────────────────
// Filters recipes by mealType, user preferences, and budget.
// Returns a sorted array (deterministic order by id).
export function filterRecipes(mealType: string, profile: any, ans: any): Recipe[] {
  profile = profile || {}; ans = ans || {};

  // Resolve preference tags from q18
  const prefTags: string[] = [];
  const foodPrefs = ans.q18 || [];
  let acceptAll = false;
  for (let i = 0; i < foodPrefs.length; i++) {
    const tag = PREF_TAG_MAP[foodPrefs[i]];
    if (tag === null) { acceptAll = true; break; }
    if (tag) prefTags.push(tag);
  }
  // If no preference selected, accept all
  if (prefTags.length === 0) acceptAll = true;

  // Resolve budget ceiling
  const budgetIdx = ans.q19 !== undefined ? ans.q19 : 3; // default: no budget limit
  const maxBudget = BUDGET_MAP[budgetIdx] || 'high';
  const maxBudgetTier = BUDGET_TIERS[maxBudget];

  // Vegetarian filter: if ALL selected prefs are vegetarian, exclude non-vegetarian
  const vegetarianOnly = !acceptAll && prefTags.length > 0 && prefTags.every(function(t){ return t === 'vegetarian'; });

  // Breastfeeding: prefer higher calorie recipes
  const breastfeeding = profile.moment === 0 && (ans.q4b === 0 || ans.q4b === 1);

  // B3: Resolve allergy exclusion keywords from q19b
  const allergyExclude: string[] = [];
  const allergies = ans.q19b || [];
  for (let ai = 0; ai < allergies.length; ai++) {
    const kw = ALLERGY_KEYWORDS[allergies[ai]];
    if (kw) { for (let ak = 0; ak < kw.length; ak++) allergyExclude.push(kw[ak]); }
  }

  // B3: Resolve max prep time from q19c
  const maxPrepMin = ans.q19c !== undefined ? (PREP_TIME_MAP[ans.q19c] || 999) : 999;

  // B4: Parse refused foods from q19d (free-text textarea)
  const refusedWords: string[] = [];
  const refusedRaw = (ans.q19d || '').toLowerCase().trim();
  if (refusedRaw) {
    // Split by comma, semicolon, newline, "și", or "si"
    const parts = refusedRaw.split(/[,;\n]+|\s+(?:și|si)\s+/);
    for (let ri = 0; ri < parts.length; ri++) {
      const word = parts[ri].trim();
      if (word.length >= 2) refusedWords.push(word);
    }
  }

  const filtered: Recipe[] = [];
  for (let j = 0; j < RECIPES.length; j++) {
    const r = RECIPES[j];
    // Meal type filter
    if (r.mealType !== mealType) continue;
    // Budget filter
    const recipeBudgetTier = BUDGET_TIERS[r.budget || 'low'];
    if (recipeBudgetTier > maxBudgetTier) continue;
    // Vegetarian filter
    if (vegetarianOnly && r.tags.indexOf('vegetarian') === -1) continue;
    // Preference match: at least one tag must match user prefs
    if (!acceptAll) {
      let hasMatch = false;
      for (let k = 0; k < r.tags.length; k++) {
        if (prefTags.indexOf(r.tags[k]) !== -1) { hasMatch = true; break; }
      }
      if (!hasMatch) continue;
    }
    // Breastfeeding: skip very low calorie meals for lunch/dinner
    if (breastfeeding && (mealType === 'lunch' || mealType === 'dinner') && r.kcal < 300) continue;

    // B3: Allergy/intolerance filter — exclude recipes containing allergen ingredients
    if (allergyExclude.length > 0) {
      let hasAllergen = false;
      const ingList = r.ingredients || [];
      for (let ig = 0; ig < ingList.length && !hasAllergen; ig++) {
        const ingLow = ingList[ig].toLowerCase();
        for (let ae = 0; ae < allergyExclude.length && !hasAllergen; ae++) {
          if (ingLow.indexOf(allergyExclude[ae]) !== -1) hasAllergen = true;
        }
      }
      if (hasAllergen) continue;
    }

    // B3: Prep time filter — exclude recipes that take longer than user's limit
    if (r.prepMin && r.prepMin > maxPrepMin) continue;

    // B4: Refused foods filter — exclude recipes whose title or ingredients match refused words
    if (refusedWords.length > 0) {
      let isRefused = false;
      const titleLow = (r.title || '').toLowerCase();
      const rIngList = r.ingredients || [];
      for (let rw = 0; rw < refusedWords.length && !isRefused; rw++) {
        if (titleLow.indexOf(refusedWords[rw]) !== -1) { isRefused = true; break; }
        for (let rg = 0; rg < rIngList.length && !isRefused; rg++) {
          if (rIngList[rg].toLowerCase().indexOf(refusedWords[rw]) !== -1) isRefused = true;
        }
      }
      if (isRefused) continue;
    }

    filtered.push(r);
  }

  // Sort by id for deterministic output
  filtered.sort(function(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });

  return filtered;
}

// ── CALORIE TARGETS PER SLOT ─────────────────────────────────────────
// Distributes daily kcal target across meal slots.
// goal: 0=lose, 1=tone, 2=energy, 3=health
export function calcSlotTargets(profile: any, ans: any): Record<string, number> {
  profile = profile || {}; ans = ans || {};

  const bmr = calcBMR(profile.weight || 65, profile.height || 165, profile.age || 35);
  const tdee = calcTDEE(bmr, profile.activity || 0);

  // Goal-based calorie adjustment
  const goal = profile.goal;
  let dailyKcal: number;
  if (goal === 0) dailyKcal = tdee - 400;       // lose weight: moderate deficit
  else if (goal === 1) dailyKcal = tdee - 200;   // tone: slight deficit
  else if (goal === 2) dailyKcal = tdee;          // energy: maintenance
  else dailyKcal = tdee;                          // health: maintenance

  // Breastfeeding: add 300-500 kcal
  const breastfeeding = profile.moment === 0 && (ans.q4b === 0 || ans.q4b === 1);
  if (breastfeeding) dailyKcal += 400;

  // Floor: never go below 1200
  if (dailyKcal < 1200) dailyKcal = 1200;

  // Determine number of snacks based on q14 (meal frequency)
  const mealFreq = ans.q14 !== undefined ? ans.q14 : 1;
  const hasSnacks = (mealFreq >= 2); // "3 mese + gustări" or "mănânc când apuc"

  // Distribution ratios
  const slots: Record<string, number> = {};
  if (hasSnacks) {
    slots.breakfast = Math.round(dailyKcal * 0.25);
    slots.lunch     = Math.round(dailyKcal * 0.30);
    slots.dinner    = Math.round(dailyKcal * 0.25);
    slots.snack1    = Math.round(dailyKcal * 0.10);
    slots.snack2    = Math.round(dailyKcal * 0.10);
  } else {
    slots.breakfast = Math.round(dailyKcal * 0.28);
    slots.lunch     = Math.round(dailyKcal * 0.38);
    slots.dinner    = Math.round(dailyKcal * 0.34);
    slots.snack1    = 0;
    slots.snack2    = 0;
  }

  slots.dailyKcal = Math.round(dailyKcal);
  return slots;
}

// ── DETERMINISTIC RECIPE PICKER ──────────────────────────────────────
// Picks the recipe closest to target kcal from a filtered list.
// Tie-breaking: first by kcal distance, then by id (deterministic).
export function pickRecipe(filtered: Recipe[], targetKcal: number, usedIds: Record<string, boolean>): Recipe | null {
  usedIds = usedIds || {};
  let best: Recipe | null = null;
  let bestDist = Infinity;

  for (let i = 0; i < filtered.length; i++) {
    const r = filtered[i];
    if (usedIds[r.id]) continue; // no duplicates in same day
    const dist = Math.abs(r.kcal - targetKcal);
    if (dist < bestDist) {
      bestDist = dist;
      best = r;
    }
  }

  return best; // null if nothing available
}

// ── BUILD DAY PLAN ───────────────────────────────────────────────────
// Returns a deterministic 1-day meal plan based on user profile + answers.
// Output: { dailyKcal, slots: { breakfast: {recipe, targetKcal}, ... }, totalKcal, totalProtein, totalCarbs, totalFat }
export function buildDayPlan(profile: any, ans: any): any {
  profile = profile || {}; ans = ans || {};

  const targets = calcSlotTargets(profile, ans);
  const usedIds: Record<string, boolean> = {};
  const plan: any = {
    dailyKcal: targets.dailyKcal,
    slots: {},
    totalKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  };

  // Slot definitions: [slotName, mealType, targetKey]
  const slotDefs: [string, string, string][] = [
    ['breakfast', 'breakfast', 'breakfast'],
    ['lunch',     'lunch',     'lunch'],
    ['dinner',    'dinner',    'dinner']
  ];

  // Add snack slots if targets > 0
  if (targets.snack1 > 0) slotDefs.push(['snack1', 'snack', 'snack1']);
  if (targets.snack2 > 0) slotDefs.push(['snack2', 'snack', 'snack2']);

  for (let i = 0; i < slotDefs.length; i++) {
    const slotName = slotDefs[i][0];
    const mealType = slotDefs[i][1];
    const targetKey = slotDefs[i][2];
    const targetKcal = targets[targetKey];

    const filtered = filterRecipes(mealType, profile, ans);
    const recipe = pickRecipe(filtered, targetKcal, usedIds);

    if (recipe) {
      usedIds[recipe.id] = true;
      plan.slots[slotName] = {
        recipe: recipe,
        targetKcal: targetKcal
      };
      plan.totalKcal += recipe.kcal;
      plan.totalProtein += recipe.protein;
      plan.totalCarbs += recipe.carbs;
      plan.totalFat += recipe.fat;
    } else {
      // Fallback: empty slot with note
      plan.slots[slotName] = {
        recipe: null,
        targetKcal: targetKcal,
        fallback: true
      };
    }
  }

  return plan;
}

// ── SHOPPING LIST ────────────────────────────────────────────────────
// Aggregates ingredients from a day plan into a de-duped shopping list.
// Returns sorted array of {name, count, recipes[]} objects.
export function shoppingList(plan: any): { name: string; count: number; recipes: string[] }[] {
  if (!plan || !plan.slots) return [];

  const map: Record<string, { name: string; count: number; recipes: string[] }> = {}; // ingredient name (lowercase) → {name (original case), count, recipes[]}
  const slots = plan.slots;
  const keys = Object.keys(slots);

  for (let i = 0; i < keys.length; i++) {
    const slot = slots[keys[i]];
    if (!slot || !slot.recipe) continue;
    const recipe = slot.recipe;
    const ingList = recipe.ingredients || [];

    for (let j = 0; j < ingList.length; j++) {
      const raw = ingList[j];
      const key = raw.toLowerCase().trim();
      if (!key) continue;

      if (!map[key]) {
        map[key] = { name: raw, count: 0, recipes: [] };
      }
      map[key].count++;
      if (map[key].recipes.indexOf(recipe.title) === -1) {
        map[key].recipes.push(recipe.title);
      }
    }
  }

  // Convert to sorted array (alphabetical by name)
  const list: { name: string; count: number; recipes: string[] }[] = [];
  const mapKeys = Object.keys(map);
  for (let k = 0; k < mapKeys.length; k++) {
    list.push(map[mapKeys[k]]);
  }
  list.sort(function(a, b) {
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 :
           a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0;
  });

  return list;
}
