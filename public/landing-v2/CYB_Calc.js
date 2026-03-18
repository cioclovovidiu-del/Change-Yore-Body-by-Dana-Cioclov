// =============================================================================
// CYB CALC — Shared utility/math functions
// Pure functions: no DOM, no state. bmiCat requires UI (from COPY) loaded first.
// =============================================================================

function calcBMI(w,h){return w/((h/100)**2)}
function calcBMR(w,h,a){return (10*w)+(6.25*h)-(5*a)-161}
function calcTDEE(bmr,act){const f=[1.2,1.375,1.55,1.725];return bmr*f[act]}
function bmiCat(bmi){const c=UI.bmiCategories;for(const cat of c){if(bmi<cat.max)return{label:cat.label,cls:cat.cls}}return{label:c[c.length-1].label,cls:c[c.length-1].cls}}
function bmiPercent(bmi){return Math.min(Math.max((bmi-15)/(40-15)*100,2),98)}
function idealWeight(h){const low=(18.5*(h/100)**2).toFixed(0);const high=(24.9*(h/100)**2).toFixed(0);return `${low}–${high} kg`}
function projWeeks(current,target){const deficit=500;const perWeek=deficit*7/7700;const diff=current-target;if(diff<=0)return 12;return Math.min(Math.ceil(diff/perWeek),52)}
