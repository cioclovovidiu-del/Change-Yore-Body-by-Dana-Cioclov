// =============================================================================
// CYB RECIPES — Recipe Database + Deterministic Meal Planner
// Requires: CYB_Calc.js (calcBMR, calcTDEE) loaded before this.
// Exports: RECIPES, buildDayPlan, filterRecipes, MEAL_SLOTS
// =============================================================================

// ── MEAL SLOTS ───────────────────────────────────────────────────────
var MEAL_SLOTS = ['breakfast','lunch','dinner','snack1','snack2'];

// ── RECIPE DATABASE ──────────────────────────────────────────────────
// Tags: traditional, mediterranean, simple, asian, vegetarian, quick
// Exclusions: diabetes, hypothyroid, pcos, hypertension, breastfeeding
// mealType: breakfast | lunch | dinner | snack
var RECIPES = [

  // ═══════════════════════════════════════════════════════════════════
  // BREAKFAST (20 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'b01', title:'Omletă cu legume și brânză', mealType:'breakfast',
   kcal:320, protein:22, carbs:12, fat:20,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ouă','ardei','roșii','brânză','ulei de măsline']},

  {id:'b02', title:'Ovăz cu banană și scorțișoară', mealType:'breakfast',
   kcal:350, protein:10, carbs:55, fat:8,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:8, servings:1, budget:'low',
   ingredients:['fulgi de ovăz','banană','scorțișoară','lapte','miere']},

  {id:'b03', title:'Iaurt grecesc cu nuci și fructe de pădure', mealType:'breakfast',
   kcal:280, protein:18, carbs:22, fat:14,
   tags:['mediterranean','simple','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['iaurt grecesc','nuci','afine','zmeură','miere']},

  {id:'b04', title:'Pâine integrală cu avocado și ou poșat', mealType:'breakfast',
   kcal:380, protein:16, carbs:30, fat:22,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:12, servings:1, budget:'medium',
   ingredients:['pâine integrală','avocado','ou','lămâie','sare']},

  {id:'b05', title:'Clătite proteice cu iaurt', mealType:'breakfast',
   kcal:340, protein:28, carbs:35, fat:8,
   tags:['simple','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'low',
   ingredients:['ovăz','ou','iaurt','banană','ulei de cocos']},

  {id:'b06', title:'Budincă de chia cu lapte de cocos', mealType:'breakfast',
   kcal:290, protein:8, carbs:28, fat:16,
   tags:['vegetarian','mediterranean'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['semințe de chia','lapte de cocos','miere','vanilie','fructe']},

  {id:'b07', title:'Sandwich cald cu șuncă și cașcaval', mealType:'breakfast',
   kcal:380, protein:22, carbs:32, fat:18,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:8, servings:1, budget:'low',
   ingredients:['pâine integrală','șuncă presată','cașcaval','roșii','unt']},

  {id:'b08', title:'Smoothie verde cu spanac și banană', mealType:'breakfast',
   kcal:250, protein:8, carbs:40, fat:6,
   tags:['vegetarian','simple','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['spanac','banană','lapte','semințe de in','miere']},

  {id:'b09', title:'Ouă fierte cu pâine și roșii', mealType:'breakfast',
   kcal:300, protein:18, carbs:28, fat:14,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ouă','pâine integrală','roșii','unt','sare']},

  {id:'b10', title:'Tartine cu hummus și legume', mealType:'breakfast',
   kcal:310, protein:12, carbs:38, fat:12,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:8, servings:1, budget:'low',
   ingredients:['pâine integrală','hummus','castraveți','ardei','semințe']},

  {id:'b11', title:'Mămăligă cu brânză și smântână', mealType:'breakfast',
   kcal:360, protein:14, carbs:40, fat:16,
   tags:['traditional'], exclusions:[],
   prepMin:20, servings:1, budget:'low',
   ingredients:['mălai','brânză de vaci','smântână','unt','sare']},

  {id:'b12', title:'Granola cu iaurt și fructe', mealType:'breakfast',
   kcal:370, protein:14, carbs:48, fat:14,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['granola','iaurt','căpșuni','miere','semințe de floarea-soarelui']},

  {id:'b13', title:'Porridge cu mere și nuci', mealType:'breakfast',
   kcal:340, protein:10, carbs:50, fat:12,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['fulgi de ovăz','mere','nuci','scorțișoară','lapte']},

  {id:'b14', title:'Wrap cu ou și avocado', mealType:'breakfast',
   kcal:390, protein:18, carbs:30, fat:24,
   tags:['mediterranean','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['tortilla integrală','ou','avocado','spanac','roșii']},

  {id:'b15', title:'Brânză de vaci cu roșii și semințe', mealType:'breakfast',
   kcal:260, protein:20, carbs:14, fat:14,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['brânză de vaci','roșii','semințe de dovleac','ulei de măsline','sare']},

  {id:'b16', title:'Orez cu lapte și scorțișoară', mealType:'breakfast',
   kcal:330, protein:8, carbs:56, fat:8,
   tags:['traditional','simple'], exclusions:[],
   prepMin:20, servings:1, budget:'low',
   ingredients:['orez','lapte','scorțișoară','zahăr','vanilie']},

  {id:'b17', title:'Toast cu ricotta și miere', mealType:'breakfast',
   kcal:300, protein:14, carbs:34, fat:12,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['pâine integrală','ricotta','miere','nuci','scorțișoară']},

  {id:'b18', title:'Omletă cu ciuperci și spanac', mealType:'breakfast',
   kcal:280, protein:20, carbs:8, fat:18,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ouă','ciuperci','spanac','ulei de măsline','sare']},

  {id:'b19', title:'Supă de ovăz cu ou (ciorba de zdrențe)', mealType:'breakfast',
   kcal:290, protein:14, carbs:34, fat:10,
   tags:['traditional'], exclusions:[],
   prepMin:15, servings:1, budget:'low',
   ingredients:['fulgi de ovăz','ou','supă de legume','lămâie','pătrunjel']},

  {id:'b20', title:'Tofu scramble cu legume (vegan)', mealType:'breakfast',
   kcal:270, protein:18, carbs:16, fat:14,
   tags:['vegetarian','asian'], exclusions:[],
   prepMin:12, servings:1, budget:'medium',
   ingredients:['tofu','ardei','ceapă','turmeric','spanac']},

  // ═══════════════════════════════════════════════════════════════════
  // LUNCH (25 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'l01', title:'Piept de pui la grătar cu salată', mealType:'lunch',
   kcal:420, protein:38, carbs:18, fat:22,
   tags:['simple','mediterranean'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['piept de pui','mix salată','roșii','castraveți','ulei de măsline']},

  {id:'l02', title:'Ciorbă de legume cu smântână', mealType:'lunch',
   kcal:280, protein:10, carbs:32, fat:12,
   tags:['traditional','simple'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['morcov','cartofi','fasole verde','roșii','smântână']},

  {id:'l03', title:'Bowl cu quinoa, năut și legume', mealType:'lunch',
   kcal:450, protein:18, carbs:55, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['quinoa','năut','avocado','roșii cherry','lămâie']},

  {id:'l04', title:'Sarmale în foi de viță cu mămăligă', mealType:'lunch',
   kcal:520, protein:24, carbs:42, fat:28,
   tags:['traditional'], exclusions:[],
   prepMin:90, servings:4, budget:'low',
   ingredients:['carne tocată','orez','foi de viță','ceapă','mălai']},

  {id:'l05', title:'Paste integrale cu sos de roșii și pui', mealType:'lunch',
   kcal:460, protein:32, carbs:50, fat:14,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:20, servings:1, budget:'low',
   ingredients:['paste integrale','piept de pui','roșii pasate','usturoi','busuioc']},

  {id:'l06', title:'Salată de ton cu fasole și legume', mealType:'lunch',
   kcal:380, protein:30, carbs:28, fat:16,
   tags:['mediterranean','simple','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['ton conservat','fasole','ceapă roșie','porumb','lămâie']},

  {id:'l07', title:'Supă cremă de broccoli', mealType:'lunch',
   kcal:260, protein:12, carbs:24, fat:14,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['broccoli','cartof','ceapă','smântână','sare']},

  {id:'l08', title:'Pilaf de orez cu legume și pui', mealType:'lunch',
   kcal:480, protein:28, carbs:52, fat:16,
   tags:['traditional','simple'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['orez','piept de pui','morcov','mazăre','ardei']},

  {id:'l09', title:'Wrap cu pui, hummus și legume', mealType:'lunch',
   kcal:420, protein:28, carbs:36, fat:18,
   tags:['mediterranean','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['tortilla integrală','pui','hummus','salată','roșii']},

  {id:'l10', title:'Ghiveci de legume', mealType:'lunch',
   kcal:320, protein:10, carbs:42, fat:12,
   tags:['traditional','vegetarian'], exclusions:[],
   prepMin:40, servings:3, budget:'low',
   ingredients:['vinete','ardei','dovlecei','roșii','cartofi']},

  {id:'l11', title:'Curry de linte cu orez', mealType:'lunch',
   kcal:440, protein:20, carbs:58, fat:12,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['linte roșie','lapte de cocos','curry','orez','spanac']},

  {id:'l12', title:'Tocăniță de pui cu cartofi', mealType:'lunch',
   kcal:460, protein:30, carbs:38, fat:20,
   tags:['traditional'], exclusions:[],
   prepMin:40, servings:2, budget:'low',
   ingredients:['pui','cartofi','ceapă','roșii','boia']},

  {id:'l13', title:'Salată Caesar cu pui', mealType:'lunch',
   kcal:400, protein:32, carbs:18, fat:24,
   tags:['simple','mediterranean'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['piept de pui','salată romană','parmezan','crutoane','dressing']},

  {id:'l14', title:'Supă cremă de dovleac', mealType:'lunch',
   kcal:240, protein:6, carbs:32, fat:10,
   tags:['vegetarian','simple'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['dovleac','cartof','ceapă','smântână','semințe de dovleac']},

  {id:'l15', title:'Pui teriyaki cu orez și broccoli', mealType:'lunch',
   kcal:470, protein:34, carbs:48, fat:14,
   tags:['asian'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['piept de pui','sos soia','miere','ghimbir','orez','broccoli']},

  {id:'l16', title:'Chiftele de curcan cu piure', mealType:'lunch',
   kcal:440, protein:28, carbs:36, fat:20,
   tags:['traditional','simple'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['curcan tocat','ou','pesmet','cartofi','unt']},

  {id:'l17', title:'Salată cu halloumi la grătar', mealType:'lunch',
   kcal:400, protein:22, carbs:20, fat:26,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['halloumi','mix salată','ardei','roșii','ulei de măsline']},

  {id:'l18', title:'Ciorbă de perișoare', mealType:'lunch',
   kcal:340, protein:20, carbs:28, fat:16,
   tags:['traditional'], exclusions:[],
   prepMin:40, servings:3, budget:'low',
   ingredients:['carne tocată','orez','morcov','leuștean','borș']},

  {id:'l19', title:'Buddha bowl cu edamame', mealType:'lunch',
   kcal:430, protein:22, carbs:48, fat:16,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['orez brun','edamame','avocado','morcov','sos soia']},

  {id:'l20', title:'Mușchi de porc cu legume la cuptor', mealType:'lunch',
   kcal:440, protein:34, carbs:24, fat:24,
   tags:['traditional'], exclusions:[],
   prepMin:45, servings:2, budget:'medium',
   ingredients:['mușchi de porc','cartofi dulci','dovlecei','ceapă','rozmarin']},

  {id:'l21', title:'Paste cu pesto și roșii cherry', mealType:'lunch',
   kcal:420, protein:14, carbs:50, fat:18,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:12, servings:1, budget:'medium',
   ingredients:['paste integrale','pesto','roșii cherry','parmezan','busuioc']},

  {id:'l22', title:'Fasole bătută cu ceapă călită', mealType:'lunch',
   kcal:350, protein:16, carbs:46, fat:10,
   tags:['traditional','vegetarian'], exclusions:[],
   prepMin:60, servings:3, budget:'low',
   ingredients:['fasole','ceapă','ulei de floarea-soarelui','boia','sare']},

  {id:'l23', title:'Salată de linte cu legume', mealType:'lunch',
   kcal:360, protein:18, carbs:44, fat:10,
   tags:['mediterranean','vegetarian','simple'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['linte verde','roșii','castraveți','ceapă roșie','lămâie']},

  {id:'l24', title:'Stir-fry de legume cu tofu', mealType:'lunch',
   kcal:350, protein:20, carbs:30, fat:16,
   tags:['asian','vegetarian','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['tofu','broccoli','ardei','morcov','sos soia']},

  {id:'l25', title:'Supă de pui cu tăiței', mealType:'lunch',
   kcal:320, protein:24, carbs:30, fat:10,
   tags:['traditional','simple'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['pui','tăiței','morcov','țelină','pătrunjel']},

  // ═══════════════════════════════════════════════════════════════════
  // DINNER (25 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'d01', title:'Somon la cuptor cu legume', mealType:'dinner',
   kcal:420, protein:34, carbs:18, fat:24,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:25, servings:1, budget:'high',
   ingredients:['somon','sparanghel','lămâie','usturoi','ulei de măsline']},

  {id:'d02', title:'Piept de pui cu cartofi dulci', mealType:'dinner',
   kcal:440, protein:36, carbs:38, fat:14,
   tags:['simple'], exclusions:[],
   prepMin:30, servings:1, budget:'medium',
   ingredients:['piept de pui','cartofi dulci','broccoli','ulei de măsline','condimente']},

  {id:'d03', title:'Salată caldă cu quinoa și legume la grătar', mealType:'dinner',
   kcal:380, protein:16, carbs:42, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['quinoa','dovlecei','ardei','vinete','feta']},

  {id:'d04', title:'Supă cremă de linte roșie', mealType:'dinner',
   kcal:310, protein:16, carbs:40, fat:8,
   tags:['simple','vegetarian','asian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['linte roșie','morcov','ceapă','turmeric','lămâie']},

  {id:'d05', title:'Pui cu legume în stil asiatic', mealType:'dinner',
   kcal:400, protein:30, carbs:32, fat:16,
   tags:['asian','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['piept de pui','broccoli','ardei','sos soia','ghimbir']},

  {id:'d06', title:'Paste cu somon afumat și smântână', mealType:'dinner',
   kcal:480, protein:26, carbs:46, fat:20,
   tags:['mediterranean'], exclusions:[],
   prepMin:15, servings:1, budget:'high',
   ingredients:['paste integrale','somon afumat','smântână','mărar','lămâie']},

  {id:'d07', title:'Ciorbă de fasole cu afumătură', mealType:'dinner',
   kcal:380, protein:18, carbs:40, fat:16,
   tags:['traditional'], exclusions:[],
   prepMin:50, servings:3, budget:'low',
   ingredients:['fasole','afumătură','ceapă','morcov','borș']},

  {id:'d08', title:'Omletă spaniolă (tortilla de cartofi)', mealType:'dinner',
   kcal:350, protein:18, carbs:28, fat:18,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['ouă','cartofi','ceapă','ulei de măsline','sare']},

  {id:'d09', title:'Curry de năut cu spanac', mealType:'dinner',
   kcal:390, protein:16, carbs:44, fat:16,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:25, servings:2, budget:'low',
   ingredients:['năut','spanac','roșii','lapte de cocos','curry']},

  {id:'d10', title:'File de cod cu piure de conopidă', mealType:'dinner',
   kcal:340, protein:30, carbs:20, fat:16,
   tags:['simple','mediterranean'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['cod','conopidă','unt','usturoi','lămâie']},

  {id:'d11', title:'Ardei umpluți cu orez și carne', mealType:'dinner',
   kcal:420, protein:22, carbs:38, fat:20,
   tags:['traditional'], exclusions:[],
   prepMin:50, servings:3, budget:'low',
   ingredients:['ardei','carne tocată','orez','roșii','smântână']},

  {id:'d12', title:'Salată nicoise cu ton', mealType:'dinner',
   kcal:380, protein:28, carbs:22, fat:20,
   tags:['mediterranean','simple'], exclusions:[],
   prepMin:15, servings:1, budget:'medium',
   ingredients:['ton','ouă fierte','cartofi','fasole verde','măsline']},

  {id:'d13', title:'Tocăniță de ciuperci cu mămăligă', mealType:'dinner',
   kcal:360, protein:12, carbs:42, fat:16,
   tags:['traditional','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['ciuperci','ceapă','roșii','boia','mălai']},

  {id:'d14', title:'Wrap cu falafel și salată', mealType:'dinner',
   kcal:400, protein:14, carbs:44, fat:18,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['năut','condimente','salată','roșii','sos tahini']},

  {id:'d15', title:'Pui la cuptor cu legume de sezon', mealType:'dinner',
   kcal:430, protein:34, carbs:24, fat:22,
   tags:['traditional','simple'], exclusions:[],
   prepMin:40, servings:2, budget:'low',
   ingredients:['pulpe de pui','cartofi','morcov','ceapă','rozmarin']},

  {id:'d16', title:'Orez prăjit cu legume și ou', mealType:'dinner',
   kcal:380, protein:14, carbs:48, fat:14,
   tags:['asian','vegetarian','quick'], exclusions:[],
   prepMin:12, servings:1, budget:'low',
   ingredients:['orez','ou','mazăre','morcov','sos soia']},

  {id:'d17', title:'Supă minestrone', mealType:'dinner',
   kcal:280, protein:10, carbs:36, fat:10,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:30, servings:2, budget:'low',
   ingredients:['fasole','paste mici','morcov','țelină','roșii']},

  {id:'d18', title:'Plăcintă cu brânză și spanac', mealType:'dinner',
   kcal:400, protein:18, carbs:34, fat:22,
   tags:['traditional'], exclusions:[],
   prepMin:40, servings:3, budget:'low',
   ingredients:['foi de plăcintă','brânză','spanac','ouă','unt']},

  {id:'d19', title:'Shakshuka (ouă în sos de roșii)', mealType:'dinner',
   kcal:320, protein:18, carbs:22, fat:18,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:15, servings:1, budget:'low',
   ingredients:['ouă','roșii','ardei','ceapă','condimente']},

  {id:'d20', title:'Paste cu vinete și ricotta', mealType:'dinner',
   kcal:420, protein:16, carbs:50, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:25, servings:1, budget:'medium',
   ingredients:['paste integrale','vinete','ricotta','roșii','busuioc']},

  {id:'d21', title:'Pui cu susan și legume (asian style)', mealType:'dinner',
   kcal:410, protein:32, carbs:28, fat:18,
   tags:['asian'], exclusions:[],
   prepMin:20, servings:1, budget:'medium',
   ingredients:['piept de pui','susan','broccoli','ardei','sos soia']},

  {id:'d22', title:'Cartofi copți cu brânză și ceapă verde', mealType:'dinner',
   kcal:380, protein:14, carbs:46, fat:16,
   tags:['traditional','simple','vegetarian'], exclusions:[],
   prepMin:45, servings:2, budget:'low',
   ingredients:['cartofi','brânză de vaci','smântână','ceapă verde','mărar']},

  {id:'d23', title:'Ratatouille cu ou la cuptor', mealType:'dinner',
   kcal:320, protein:14, carbs:28, fat:16,
   tags:['mediterranean','vegetarian'], exclusions:[],
   prepMin:35, servings:2, budget:'low',
   ingredients:['vinete','dovlecei','ardei','roșii','ouă']},

  {id:'d24', title:'Supă miso cu tofu și alge', mealType:'dinner',
   kcal:200, protein:12, carbs:18, fat:8,
   tags:['asian','vegetarian'], exclusions:[],
   prepMin:10, servings:1, budget:'medium',
   ingredients:['pastă miso','tofu','alge nori','ceapă verde','ghimbir']},

  {id:'d25', title:'Musaca de vinete', mealType:'dinner',
   kcal:440, protein:22, carbs:30, fat:26,
   tags:['traditional'], exclusions:[],
   prepMin:60, servings:4, budget:'low',
   ingredients:['vinete','carne tocată','roșii','sos béchamel','cașcaval']},

  // ═══════════════════════════════════════════════════════════════════
  // SNACKS (20 recipes)
  // ═══════════════════════════════════════════════════════════════════
  {id:'s01', title:'Măr cu unt de arahide', mealType:'snack',
   kcal:200, protein:6, carbs:24, fat:10,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['măr','unt de arahide']},

  {id:'s02', title:'Iaurt cu semințe de in', mealType:'snack',
   kcal:150, protein:10, carbs:12, fat:6,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['iaurt','semințe de in']},

  {id:'s03', title:'Mix de nuci și fructe uscate', mealType:'snack',
   kcal:220, protein:6, carbs:22, fat:14,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:1, servings:1, budget:'medium',
   ingredients:['nuci','migdale','stafide','caise uscate']},

  {id:'s04', title:'Hummus cu bețișoare de legume', mealType:'snack',
   kcal:180, protein:8, carbs:20, fat:8,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['hummus','morcov','castravete','ardei']},

  {id:'s05', title:'Brânză de vaci cu roșii cherry', mealType:'snack',
   kcal:140, protein:14, carbs:6, fat:6,
   tags:['traditional','simple','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['brânză de vaci','roșii cherry','sare']},

  {id:'s06', title:'Banană cu iaurt grecesc', mealType:'snack',
   kcal:180, protein:10, carbs:28, fat:4,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['banană','iaurt grecesc']},

  {id:'s07', title:'Ou fiert cu sare și pâine', mealType:'snack',
   kcal:170, protein:12, carbs:14, fat:8,
   tags:['simple','traditional','quick'], exclusions:[],
   prepMin:10, servings:1, budget:'low',
   ingredients:['ou','pâine integrală','sare']},

  {id:'s08', title:'Smoothie cu fructe și iaurt', mealType:'snack',
   kcal:200, protein:8, carbs:32, fat:4,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['banană','căpșuni','iaurt','miere']},

  {id:'s09', title:'Edamame cu sare de mare', mealType:'snack',
   kcal:160, protein:14, carbs:10, fat:6,
   tags:['asian','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['edamame','sare de mare']},

  {id:'s10', title:'Biscuiți de ovăz cu banană', mealType:'snack',
   kcal:180, protein:4, carbs:30, fat:6,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:20, servings:6, budget:'low',
   ingredients:['fulgi de ovăz','banană','miere','scorțișoară']},

  {id:'s11', title:'Tartină cu avocado', mealType:'snack',
   kcal:200, protein:4, carbs:18, fat:14,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:3, servings:1, budget:'medium',
   ingredients:['pâine integrală','avocado','lămâie','sare']},

  {id:'s12', title:'Morcovi copți cu miere și semințe', mealType:'snack',
   kcal:150, protein:4, carbs:22, fat:6,
   tags:['simple','vegetarian'], exclusions:[],
   prepMin:20, servings:2, budget:'low',
   ingredients:['morcov','miere','semințe de susan','ulei de măsline']},

  {id:'s13', title:'Bruschetă cu roșii și busuioc', mealType:'snack',
   kcal:170, protein:4, carbs:22, fat:8,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['pâine','roșii','busuioc','usturoi','ulei de măsline']},

  {id:'s14', title:'Covrigei cu hummus', mealType:'snack',
   kcal:190, protein:6, carbs:28, fat:6,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'low',
   ingredients:['covrigei','hummus']},

  {id:'s15', title:'Cașcaval cu struguri', mealType:'snack',
   kcal:200, protein:10, carbs:16, fat:12,
   tags:['simple','traditional','quick'], exclusions:[],
   prepMin:2, servings:1, budget:'medium',
   ingredients:['cașcaval','struguri']},

  {id:'s16', title:'Bile energizante cu curmale', mealType:'snack',
   kcal:180, protein:4, carbs:26, fat:8,
   tags:['vegetarian','simple'], exclusions:[],
   prepMin:10, servings:4, budget:'low',
   ingredients:['curmale','nuci','cacao','cocos']},

  {id:'s17', title:'Salată de fructe proaspete', mealType:'snack',
   kcal:120, protein:2, carbs:28, fat:1,
   tags:['simple','vegetarian','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'low',
   ingredients:['mere','banane','portocale','kiwi']},

  {id:'s18', title:'Ardei mini umpluți cu brânză', mealType:'snack',
   kcal:160, protein:10, carbs:8, fat:10,
   tags:['mediterranean','quick'], exclusions:[],
   prepMin:5, servings:1, budget:'medium',
   ingredients:['ardei mini','brânză cremă','mărar']},

  {id:'s19', title:'Pâine cu ricotta și miere', mealType:'snack',
   kcal:190, protein:8, carbs:24, fat:6,
   tags:['mediterranean','vegetarian','quick'], exclusions:[],
   prepMin:3, servings:1, budget:'medium',
   ingredients:['pâine integrală','ricotta','miere']},

  {id:'s20', title:'Chips de kale', mealType:'snack',
   kcal:100, protein:4, carbs:12, fat:4,
   tags:['vegetarian','simple'], exclusions:[],
   prepMin:15, servings:2, budget:'low',
   ingredients:['kale','ulei de măsline','sare','usturoi praf']}
];

// ── BUDGET MAP ───────────────────────────────────────────────────────
// Maps q19 answer index → max budget tier
var BUDGET_MAP = {0:'low', 1:'medium', 2:'high', 3:'high'};

// ── FOOD PREF MAP ────────────────────────────────────────────────────
// Maps q18 answer indices → recipe tag names
var PREF_TAG_MAP = {
  0: 'traditional',
  1: 'mediterranean',
  2: 'simple',
  3: 'asian',
  4: 'vegetarian',
  5: null           // "mănânc orice" → no filter
};

// ── BUDGET TIER ORDERING ─────────────────────────────────────────────
var BUDGET_TIERS = {low:0, medium:1, high:2};

// ── FILTER RECIPES ───────────────────────────────────────────────────
// Filters recipes by mealType, user preferences, and budget.
// Returns a sorted array (deterministic order by id).
function filterRecipes(mealType, profile, ans) {
  profile = profile || {}; ans = ans || {};

  // Resolve preference tags from q18
  var prefTags = [];
  var foodPrefs = ans.q18 || [];
  var acceptAll = false;
  for (var i = 0; i < foodPrefs.length; i++) {
    var tag = PREF_TAG_MAP[foodPrefs[i]];
    if (tag === null) { acceptAll = true; break; }
    if (tag) prefTags.push(tag);
  }
  // If no preference selected, accept all
  if (prefTags.length === 0) acceptAll = true;

  // Resolve budget ceiling
  var budgetIdx = ans.q19 !== undefined ? ans.q19 : 3; // default: no budget limit
  var maxBudget = BUDGET_MAP[budgetIdx] || 'high';
  var maxBudgetTier = BUDGET_TIERS[maxBudget];

  // Vegetarian filter: if ALL selected prefs are vegetarian, exclude non-vegetarian
  var vegetarianOnly = !acceptAll && prefTags.length > 0 && prefTags.every(function(t){ return t === 'vegetarian'; });

  // Breastfeeding: prefer higher calorie recipes
  var breastfeeding = profile.moment === 0 && (ans.q4b === 0 || ans.q4b === 1);

  var filtered = [];
  for (var j = 0; j < RECIPES.length; j++) {
    var r = RECIPES[j];
    // Meal type filter
    if (r.mealType !== mealType) continue;
    // Budget filter
    var recipeBudgetTier = BUDGET_TIERS[r.budget || 'low'];
    if (recipeBudgetTier > maxBudgetTier) continue;
    // Vegetarian filter
    if (vegetarianOnly && r.tags.indexOf('vegetarian') === -1) continue;
    // Preference match: at least one tag must match user prefs
    if (!acceptAll) {
      var hasMatch = false;
      for (var k = 0; k < r.tags.length; k++) {
        if (prefTags.indexOf(r.tags[k]) !== -1) { hasMatch = true; break; }
      }
      if (!hasMatch) continue;
    }
    // Breastfeeding: skip very low calorie meals for lunch/dinner
    if (breastfeeding && (mealType === 'lunch' || mealType === 'dinner') && r.kcal < 300) continue;

    filtered.push(r);
  }

  // Sort by id for deterministic output
  filtered.sort(function(a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });

  return filtered;
}

// ── CALORIE TARGETS PER SLOT ─────────────────────────────────────────
// Distributes daily kcal target across meal slots.
// goal: 0=lose, 1=tone, 2=energy, 3=health
function calcSlotTargets(profile, ans) {
  profile = profile || {}; ans = ans || {};

  var bmr = calcBMR(profile.weight || 65, profile.height || 165, profile.age || 35);
  var tdee = calcTDEE(bmr, profile.activity || 0);

  // Goal-based calorie adjustment
  var goal = profile.goal;
  var dailyKcal;
  if (goal === 0) dailyKcal = tdee - 400;       // lose weight: moderate deficit
  else if (goal === 1) dailyKcal = tdee - 200;   // tone: slight deficit
  else if (goal === 2) dailyKcal = tdee;          // energy: maintenance
  else dailyKcal = tdee;                          // health: maintenance

  // Breastfeeding: add 300-500 kcal
  var breastfeeding = profile.moment === 0 && (ans.q4b === 0 || ans.q4b === 1);
  if (breastfeeding) dailyKcal += 400;

  // Floor: never go below 1200
  if (dailyKcal < 1200) dailyKcal = 1200;

  // Determine number of snacks based on q14 (meal frequency)
  var mealFreq = ans.q14 !== undefined ? ans.q14 : 1;
  var hasSnacks = (mealFreq >= 2); // "3 mese + gustări" or "mănânc când apuc"

  // Distribution ratios
  var slots = {};
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
function pickRecipe(filtered, targetKcal, usedIds) {
  usedIds = usedIds || {};
  var best = null;
  var bestDist = Infinity;

  for (var i = 0; i < filtered.length; i++) {
    var r = filtered[i];
    if (usedIds[r.id]) continue; // no duplicates in same day
    var dist = Math.abs(r.kcal - targetKcal);
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
function buildDayPlan(profile, ans) {
  profile = profile || {}; ans = ans || {};

  var targets = calcSlotTargets(profile, ans);
  var usedIds = {};
  var plan = {
    dailyKcal: targets.dailyKcal,
    slots: {},
    totalKcal: 0,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0
  };

  // Slot definitions: [slotName, mealType, targetKey]
  var slotDefs = [
    ['breakfast', 'breakfast', 'breakfast'],
    ['lunch',     'lunch',     'lunch'],
    ['dinner',    'dinner',    'dinner']
  ];

  // Add snack slots if targets > 0
  if (targets.snack1 > 0) slotDefs.push(['snack1', 'snack', 'snack1']);
  if (targets.snack2 > 0) slotDefs.push(['snack2', 'snack', 'snack2']);

  for (var i = 0; i < slotDefs.length; i++) {
    var slotName = slotDefs[i][0];
    var mealType = slotDefs[i][1];
    var targetKey = slotDefs[i][2];
    var targetKcal = targets[targetKey];

    var filtered = filterRecipes(mealType, profile, ans);
    var recipe = pickRecipe(filtered, targetKcal, usedIds);

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

// ── FORMAT DAY PLAN (HTML helper for results screen) ─────────────────
// Returns HTML string for displaying a model day plan.
// Designed for later integration into results renderers.
function formatDayPlanHtml(plan) {
  if (!plan || !plan.slots) return '<p style="color:var(--muted)">Nu s-a putut genera un plan alimentar.</p>';

  var slotLabels = {
    breakfast: '🌅 Mic dejun',
    lunch:     '☀️ Prânz',
    dinner:    '🌙 Cină',
    snack1:    '🍎 Gustare 1',
    snack2:    '🍎 Gustare 2'
  };

  var order = ['breakfast','lunch','snack1','dinner','snack2'];
  var html = '<div class="day-plan" style="text-align:left;">';
  html += '<p style="color:var(--accent);font-weight:600;margin-bottom:12px;">Ziua ta model — ~' + plan.dailyKcal + ' kcal</p>';

  for (var i = 0; i < order.length; i++) {
    var slot = plan.slots[order[i]];
    if (!slot) continue;
    var label = slotLabels[order[i]] || order[i];

    if (slot.recipe) {
      html += '<div style="margin-bottom:10px;padding:8px 12px;background:rgba(200,169,110,0.08);border-radius:8px;">';
      html += '<span style="color:var(--accent);font-size:13px;">' + label + '</span>';
      html += '<p style="color:var(--text);font-size:14px;margin:2px 0 0;">' + slot.recipe.title + '</p>';
      html += '<span style="color:var(--muted);font-size:12px;">' + slot.recipe.kcal + ' kcal · ' + slot.recipe.protein + 'g proteină · ' + slot.recipe.prepMin + ' min</span>';
      html += '</div>';
    } else if (slot.fallback) {
      html += '<div style="margin-bottom:10px;padding:8px 12px;background:rgba(200,169,110,0.05);border-radius:8px;">';
      html += '<span style="color:var(--accent);font-size:13px;">' + label + '</span>';
      html += '<p style="color:var(--muted);font-size:14px;margin:2px 0 0;font-style:italic;">Se va personaliza în programul complet</p>';
      html += '</div>';
    }
  }

  html += '<p style="color:var(--muted);font-size:12px;margin-top:8px;">Total: ~' + plan.totalKcal + ' kcal · ' + plan.totalProtein + 'g P · ' + plan.totalCarbs + 'g C · ' + plan.totalFat + 'g G</p>';
  html += '</div>';
  return html;
}
