"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const WA = "https://chat.whatsapp.com/Gyi1jBE4lI5JQZKTJ9jxsC";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [quizDone, setQuizDone] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".fi");
    els.forEach((el) => el.classList.add("fi-init"));
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        }),
      { threshold: 0.1 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const pick = (q: number, v: number) => {
    const a = [...answers];
    a[q] = v;
    setAnswers(a);
    if (a.every((x) => x !== null)) setTimeout(() => setQuizDone(true), 400);
  };

  const score = (answers[0] ?? 0) + (answers[1] ?? 0) + (answers[2] ?? 0);
  const result = score <= 2 ? "FREE" : score <= 4 ? "LIVE" : "TRANSFORM";

  const faqs: [string, string][] = [
    [
      "Am nevoie de experiență fitness?",
      "Nu! Programul e conceput de la zero. Fiecare exercițiu vine cu explicații video detaliate, iar Daniela te ghidează pas cu pas.",
    ],
    [
      "Am nevoie de sală sau echipament?",
      "Nu. Antrenamentele sunt gândite pentru acasă, cu greutatea corpului sau obiecte pe care le ai deja (sticle de apă, scaun, prosop).",
    ],
    [
      "Cât durează un antrenament?",
      "Între 20 și 40 de minute, în funcție de ziua din program. Sunt eficiente și se integrează ușor în orice orar.",
    ],
    [
      "Ce fac dacă am probleme medicale?",
      "Programul poate fi adaptat, dar NU înlocuiește sfatul medical. Te rugăm să consulți medicul înainte de a începe orice program de exerciții.",
    ],
    [
      "Pot plăti în rate?",
      "Da! Scrie-ne pe WhatsApp și găsim o variantă care funcționează pentru tine.",
    ],
    [
      "Ce se întâmplă după cele 12 săptămâni?",
      "Primești un plan de mentenanță personalizat + poți continua cu CYB LIVE pentru a rămâne în comunitate și în formă.",
    ],
  ];

  return (
    <div className="cyb">
      <style>{CSS}</style>

      {/* ── NAV ── */}
      <nav className={`cn${scrolled ? " cn--s" : ""}`}>
        <div className="mw cn__in">
          <Link href="/" className="cn__logo">
            <Image src="/logo.png" alt="Dana Cioclov — Change Your Body" width={120} height={120} priority />
            <div className="cn__brand">
              <span className="cn__name">Change Your Body</span>
              <span className="cn__by">by Dana Cioclov</span>
            </div>
          </Link>
          <div className="cn__nav">
            <a href="#pachete" className="cn__link">Pachete</a>
            <a href="#despre" className="cn__link">Despre</a>
            <a href="#faq" className="cn__link">FAQ</a>
          </div>
          <Link href="/chestionar" className="cn__cta">
            Hai să ne cunoaștem
          </Link>
        </div>
      </nav>

      {/* ── 1 HERO ── */}
      <section className="hero">
        <div className="hero__b hero__anim">
          <h1>
            Transformarea ta începe
            <br />
            cu un singur pas
          </h1>
          <p className="hero__sub">
            Program de fitness și nutriție creat{" "}
            <strong>DOAR pentru femei</strong>.
            <br />
            Personalizat. Realist. Fără sală.
          </p>
          <Link href="/chestionar" className="bt bt--g">
            Hai să ne cunoaștem &rarr;
          </Link>
          <div className="hero__badges">
            <span>&#9201; 12 săptămâni</span>
            <span>&#128105; Women Only</span>
            <span>&#128241; 100% Online</span>
          </div>
          <div className="hero__stats">
            <div>
              <strong>10+</strong>
              <small>ani experiență</small>
            </div>
            <div>
              <strong>78</strong>
              <small>exerciții video</small>
            </div>
            <div>
              <strong>20</strong>
              <small>locuri / ediție</small>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2 TE RECUNOȘTI? ── */}
      <section className="rec">
        <div className="mw">
          <h2 className="fi">Dacă ai încercat tot și nimic nu a mers&hellip;</h2>
          <div className="rec__g fi">
            {[
              "Diete fără energie",
              "Abonament sală nefolosit",
              "Început de 10 ori, renunțat de 11",
              "Niciun program nu e pentru TINE",
            ].map((t, i) => (
              <div key={i} className="rec__c">
                {t}
              </div>
            ))}
          </div>
          <p className="rec__bot fi">Nu ești tu problema.</p>
        </div>
      </section>

      {/* ── 3 O ZI CU CYB ── */}
      <section className="day">
        <div className="mw">
          <h2 className="fi">O zi cu CYB</h2>
          <div className="tl fi">
            {(
              [
                ["07:00", "Mesaj de bună dimineața de la Daniela"],
                ["07:30", "Antrenament 25 min — acasă, fără echipament"],
                ["08:00", "Mic dejun personalizat din planul tău"],
                ["12:30", "Rețetă prânz — rapidă și delicioasă"],
                ["17:00", "Check-in pe WhatsApp cu echipa"],
                ["21:00", "Review progres & plan pentru mâine"],
              ] as const
            ).map(([time, text], i) => (
              <div key={i} className="tl__i">
                <div className="tl__d" />
                <span className="tl__t">{time}</span>
                <span className="tl__x">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 PACHETE ── */}
      <section id="pachete" className="pk">
        <div className="mw">
          <h2 className="fi">Alege pachetul tău</h2>
          <div className="pk__g fi">
            {/* FREE */}
            <div className="pk__c">
              <h3>CYB FREE</h3>
              <div className="pk__pr">0&euro;</div>
              <ul>
                <li>Grup WhatsApp comunitate</li>
                <li>Ghid PDF de pornire</li>
                <li>Plan 1 săptămână</li>
                <li>Conținut exclusiv Instagram</li>
              </ul>
              <a
                href={WA}
                target="_blank"
                rel="noopener noreferrer"
                className="bt bt--t"
              >
                Intră în comunitate &rarr;
              </a>
            </div>

            {/* LIVE */}
            <div className="pk__c pk__c--pop">
              <div className="pk__badge">POPULAR</div>
              <h3>CYB LIVE</h3>
              <div className="pk__pr">
                69&euro;<small>/lună</small>
              </div>
              <ul>
                <li>Tot ce include FREE +</li>
                <li>3 clase LIVE Zoom / săptămână</li>
                <li>Replay disponibil 48h</li>
                <li>Plan alimentar general</li>
                <li>Fără angajament</li>
              </ul>
              <p className="pk__daily">2.30&euro; / zi</p>
              <Link href="/chestionar" className="bt bt--t">
                Începe acum &rarr;
              </Link>
            </div>

            {/* TRANSFORM */}
            <div className="pk__c pk__c--tr">
              <div className="pk__badge pk__badge--g">
                TRANSFORMARE COMPLETĂ
              </div>
              <h3>CYB TRANSFORM</h3>
              <div className="pk__pr">
                <del>599&euro;</del> 399&euro;
              </div>
              <ul>
                <li>Tot ce include LIVE +</li>
                <li>Chestionar personalizat</li>
                <li>Plan alimentar personalizat</li>
                <li>Program complet 12 săptămâni</li>
                <li>Bibliotecă video — 78 clipuri</li>
                <li>Evaluări periodice</li>
                <li>Suport 1-la-1 cu Daniela</li>
                <li>Plan de mentenanță</li>
              </ul>
              <p className="pk__daily">
                4.75&euro; / zi &middot; 20 locuri / ediție
              </p>
              <Link href="/chestionar" className="bt bt--g">
                Vreau transformarea &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5 MINI-QUIZ ── */}
      <section className="qz">
        <div className="mw">
          <h2 className="fi">Care pachet ți se potrivește?</h2>
          <div className="qz__box fi">
            {!quizDone ? (
              <>
                <div className="qz__q">
                  <p>1. Cât timp ai pe zi pentru antrenament?</p>
                  <div className="qz__opts">
                    {["10–15 min", "20–30 min", "30–45 min"].map((o, i) => (
                      <button
                        key={i}
                        className={answers[0] === i ? "act" : ""}
                        onClick={() => pick(0, i)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="qz__q">
                  <p>2. Ce e important pentru tine?</p>
                  <div className="qz__opts">
                    {(
                      [
                        ["Plan general", 0],
                        ["Totul personalizat", 2],
                      ] as const
                    ).map(([label, val], i) => (
                      <button
                        key={i}
                        className={answers[1] === val ? "act" : ""}
                        onClick={() => pick(1, val)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="qz__q">
                  <p>3. Care e bugetul tău?</p>
                  <div className="qz__opts">
                    {["0€", "Sub 100€ / lună", "Investesc serios"].map(
                      (o, i) => (
                        <button
                          key={i}
                          className={answers[2] === i ? "act" : ""}
                          onClick={() => pick(2, i)}
                        >
                          {o}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="qz__res">
                <h3>
                  Recomandarea ta:{" "}
                  <span className="qz__hl">CYB {result}</span>
                </h3>
                <p className="qz__desc">
                  {result === "FREE" &&
                    "Începe gratuit cu comunitatea noastră pe WhatsApp!"}
                  {result === "LIVE" &&
                    "Clasele live sunt perfecte pentru tine — structură și flexibilitate!"}
                  {result === "TRANSFORM" &&
                    "Ești pregătită pentru transformarea completă!"}
                </p>
                {result === "FREE" ? (
                  <a
                    href={WA}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bt bt--g"
                  >
                    Intră în comunitate &rarr;
                  </a>
                ) : (
                  <Link href="/chestionar" className="bt bt--g">
                    {result === "LIVE"
                      ? "Începe CYB LIVE \u2192"
                      : "Vreau transformarea \u2192"}
                  </Link>
                )}
                <button
                  className="qz__reset"
                  onClick={() => {
                    setAnswers([null, null, null]);
                    setQuizDone(false);
                  }}
                >
                  Refă quiz-ul
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 6 DESPRE DANIELA ── */}
      <section id="despre" className="ab">
        <div className="mw">
          <div className="ab__in fi">
            <div className="ab__ph">
              <div className="ab__circle" />
            </div>
            <div className="ab__txt">
              <h2>Cine e Daniela?</h2>
              <p>
                Instructor fitness cu peste{" "}
                <strong>10 ani de experiență</strong>, Daniela este{" "}
                <strong>Tehnician Nutriționist</strong> cu specializare în{" "}
                <strong>Fizioterapie &amp; Kinetoterapie</strong>.
              </p>
              <div className="ab__creds">
                <span>&#127947;&#65039; Instructor Fitness 10+ ani</span>
                <span>&#129367; Tehnician Nutriționist</span>
                <span>&#128134; Fizioterapie &amp; Kinetoterapie</span>
              </div>
              <a
                href="https://instagram.com/cioclov_dana"
                target="_blank"
                rel="noopener noreferrer"
                className="ab__ig"
              >
                @cioclov_dana pe Instagram &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7 WOMEN ONLY MANIFEST ── */}
      <section className="man">
        <div className="mw">
          <div className="man__txt fi">
            <p>Acest spațiu e doar al nostru.</p>
            <p>Fără judecată. Fără intimidare.</p>
            <p>Doar femei reale, cu vieți reale.</p>
            <p>Bine ai venit acasă. &#128156;</p>
          </div>
        </div>
      </section>

      {/* ── 8 FAQ ── */}
      <section id="faq" className="fq">
        <div className="mw">
          <h2 className="fi">Întrebări frecvente</h2>
          <div className="fq__list fi">
            {faqs.map(([q, a], i) => (
              <div
                key={i}
                className={`fq__i${faqOpen === i ? " fq__i--o" : ""}`}
              >
                <button
                  className="fq__q"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  {q}
                  <span>{faqOpen === i ? "\u2212" : "+"}</span>
                </button>
                <div className="fq__a">
                  <p>{a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHATSAPP WIDGET ── */}
      <a href={WA} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" fill="#fff" width="28" height="28"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      {/* ── 9 FOOTER ── */}
      <footer className="ft">
        <div className="mw">
          <p className="ft__cta fi">
            Primul pas e cel mai greu.
            <br />
            Dar nu trebuie să-l faci singură.
          </p>
          <div className="fi">
            <Link href="/chestionar" className="bt bt--g">
              Hai să ne cunoaștem &rarr;
            </Link>
          </div>
          <div className="ft__links fi">
            <a
              href="https://instagram.com/cioclov_dana"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a href={WA} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </a>
            <Link href="/chestionar">Chestionar</Link>
          </div>
          <p className="ft__disc fi">
            Programele CYB nu înlocuiesc sfatul medical profesionist. Consultă
            medicul înainte de a începe orice program de exerciții fizice sau
            schimbare alimentară.
          </p>
          <p className="ft__copy fi">&copy; 2026 Dana Cioclov. Toate drepturile rezervate.</p>
        </div>
      </footer>
    </div>
  );
}

/* ────────────────────────── CSS ────────────────────────── */
const CSS = `
html{scroll-behavior:smooth}

/* ── GLOBAL ── */
.cyb{
  --teal:#2AA5A0;--teal-deep:#1A9E9E;--teal-dark:#157575;--teal-glow:#3ECDC6;
  --gold:#C4A35A;--dark:#0F1923;--ow:#FAFCFC;
  font-family:var(--font-outfit),system-ui,sans-serif;
  color:var(--dark);line-height:1.6;overflow-x:hidden;
}
.cyb h1,.cyb h2,.cyb h3{font-family:var(--font-cormorant),Georgia,serif;line-height:1.2}
.cyb h2{font-size:clamp(1.8rem,4vw,2.8rem);text-align:center;margin-bottom:2.5rem}
.mw{max-width:1200px;margin:0 auto;padding:0 1.5rem}

/* ── FADE-IN ── */
.fi{opacity:1;transform:translateY(0);transition:opacity .7s ease,transform .7s ease}
.fi.fi-init{opacity:0;transform:translateY(30px)}
.fi.vis{opacity:1;transform:translateY(0)}

/* ── BUTTONS ── */
.bt{display:inline-block;font-family:var(--font-outfit),sans-serif;font-weight:600;font-size:1rem;
  padding:.85rem 2rem;border-radius:50px;text-decoration:none;cursor:pointer;border:none;
  transition:transform .2s,box-shadow .2s}
.bt--g{background:var(--gold);color:var(--dark)}
.bt--g:hover{transform:translateY(-2px);box-shadow:0 6px 25px rgba(196,163,90,.45)}
.bt--t{background:var(--teal);color:#fff;width:100%;text-align:center;display:block}
.bt--t:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(42,165,160,.35)}

/* ── NAV ── */
.cn{position:fixed;top:0;left:0;right:0;z-index:100;padding:1rem 0;
  transition:background .3s,box-shadow .3s}
.cn--s{background:rgba(15,25,35,.97);box-shadow:0 2px 20px rgba(0,0,0,.3)}
.cn__in{display:flex;align-items:center;justify-content:space-between}
.cn__logo{display:flex;align-items:center;text-decoration:none;gap:.75rem}
.cn__logo img{height:44px;width:44px;border-radius:50%;object-fit:cover;transition:opacity .2s}
.cn__logo:hover img{opacity:.85}
.cn__brand{display:flex;flex-direction:column;line-height:1.2}
.cn__name{font-family:var(--font-cormorant),Georgia,serif;font-weight:700;font-size:18px;color:#fff}
.cn__by{font-family:var(--font-outfit),system-ui,sans-serif;font-size:11px;color:var(--gold);font-style:italic}
.cn__nav{display:none;align-items:center;gap:1.5rem}
.cn__link{color:rgba(255,255,255,.8);text-decoration:none;font-size:.9rem;font-weight:500;transition:color .2s}
.cn__link:hover{color:#fff}
.cn__cta{font-size:.85rem;font-weight:500;color:var(--dark);background:var(--gold);
  padding:.5rem 1.2rem;border-radius:50px;text-decoration:none;transition:transform .2s,box-shadow .2s}
.cn__cta:hover{transform:translateY(-1px);box-shadow:0 4px 15px rgba(196,163,90,.4)}

/* ── 1 HERO ── */
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;
  background:linear-gradient(160deg,var(--dark) 0%,var(--teal-dark) 100%);
  padding:7rem 1.5rem 4rem;text-align:center;color:var(--ow)}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.hero__b{max-width:820px}
.hero__anim{animation:fadeUp .8s ease both}
.hero h1{font-size:clamp(2rem,6vw,3.8rem);font-weight:700;margin-bottom:1.5rem}
.hero__sub{font-size:clamp(1rem,2.5vw,1.2rem);opacity:1;margin-bottom:2.2rem;font-weight:300}
.hero__badges{display:flex;flex-wrap:wrap;justify-content:center;gap:.75rem;margin-top:2.5rem;font-size:.88rem;opacity:.85}
.hero__badges span{background:rgba(255,255,255,.08);padding:.4rem 1rem;border-radius:50px;
  border:1px solid rgba(255,255,255,.12)}
.hero__stats{display:flex;justify-content:center;gap:2.5rem;margin-top:2.5rem;padding-top:2rem;
  border-top:1px solid rgba(255,255,255,.12)}
.hero__stats div{text-align:center}
.hero__stats strong{display:block;font-family:var(--font-cormorant),Georgia,serif;font-size:2rem;color:var(--teal-glow)}
.hero__stats small{font-size:.82rem;opacity:.7}

/* ── 2 TE RECUNOȘTI ── */
.rec{background:var(--ow);padding:5rem 0}
.rec h2{color:var(--dark)}
.rec__g{display:grid;grid-template-columns:1fr;gap:1.2rem;max-width:800px;margin:0 auto 2rem}
.rec__c{background:#fff;border:1px solid #e8eded;border-radius:16px;padding:1.8rem;
  font-size:1.05rem;font-weight:500;text-align:center;
  transition:transform .25s,border-color .25s,box-shadow .25s;cursor:default}
.rec__c:hover{transform:translateY(-4px);border-color:var(--teal);box-shadow:0 8px 30px rgba(42,165,160,.12)}
.rec__bot{text-align:center;font-family:var(--font-cormorant),Georgia,serif;
  font-size:1.6rem;font-weight:600;color:var(--teal-deep);margin-top:1rem}

/* ── 3 O ZI CU CYB ── */
.day{background:var(--dark);color:var(--ow);padding:5rem 0}
.day h2{color:var(--ow)}
.tl{position:relative;max-width:600px;margin:0 auto;padding-left:2.5rem}
.tl::before{content:"";position:absolute;left:.65rem;top:0;bottom:0;width:2px;
  background:linear-gradient(180deg,var(--teal-glow),var(--teal-dark))}
.tl__i{position:relative;padding-bottom:2rem;display:flex;gap:1rem;align-items:flex-start}
.tl__i:last-child{padding-bottom:0}
.tl__d{position:absolute;left:-2.15rem;top:.35rem;width:12px;height:12px;border-radius:50%;
  background:var(--teal-glow);box-shadow:0 0 10px rgba(62,205,198,.5);flex-shrink:0}
.tl__t{font-family:var(--font-cormorant),Georgia,serif;font-size:1.3rem;font-weight:700;
  color:var(--teal-glow);min-width:4rem}
.tl__x{font-weight:300;opacity:1;padding-top:.15rem}

/* ── 4 PACHETE ── */
.pk{background:var(--ow);padding:5rem 0}
.pk__g{display:grid;grid-template-columns:1fr;gap:1.5rem;max-width:1050px;margin:0 auto}
.pk__c{background:#fff;border:1px solid #e4e8e8;border-radius:20px;padding:2.5rem 2rem;
  display:flex;flex-direction:column;position:relative;transition:transform .25s,box-shadow .25s}
.pk__c:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08)}
.pk__c--pop{border-color:var(--teal);box-shadow:0 4px 20px rgba(42,165,160,.1)}
.pk__c--tr{border:2px solid var(--gold);box-shadow:0 4px 20px rgba(196,163,90,.15);
  background:linear-gradient(180deg,#fff 0%,#fffdf7 100%)}
.pk__badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);
  background:var(--teal);color:#fff;font-size:.75rem;font-weight:600;
  padding:.35rem 1rem;border-radius:50px;letter-spacing:.05em;white-space:nowrap}
.pk__badge--g{background:var(--gold);color:var(--dark)}
.pk__c h3{font-size:1.6rem;font-weight:700;margin-bottom:.5rem;margin-top:.5rem}
.pk__pr{font-family:var(--font-cormorant),Georgia,serif;font-size:2.8rem;font-weight:700;
  color:var(--dark);margin-bottom:1.5rem}
.pk__pr small{font-size:1rem;font-weight:400;opacity:.6}
.pk__pr del{font-size:1.6rem;opacity:.4;margin-right:.5rem}
.pk__c ul{list-style:none;margin-bottom:1.5rem;flex:1;padding:0}
.pk__c li{padding:.4rem 0 .4rem 1.5rem;position:relative;font-size:.95rem}
.pk__c li::before{content:"\\2713";position:absolute;left:0;color:var(--teal);font-weight:700}
.pk__daily{font-size:.85rem;color:var(--teal-deep);font-weight:500;margin-bottom:1rem}

/* ── 5 QUIZ ── */
.qz{background:var(--dark);color:var(--ow);padding:5rem 0}
.qz h2{color:var(--ow)}
.qz__box{max-width:600px;margin:0 auto;background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:2.5rem 2rem}
.qz__q{margin-bottom:2rem}
.qz__q:last-child{margin-bottom:0}
.qz__q p{font-weight:500;margin-bottom:.75rem;font-size:1.05rem}
.qz__opts{display:flex;flex-wrap:wrap;gap:.6rem}
.qz__opts button{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.15);
  color:var(--ow);padding:.6rem 1.2rem;border-radius:50px;
  font-family:var(--font-outfit),sans-serif;font-size:.9rem;cursor:pointer;transition:all .2s}
.qz__opts button:hover{border-color:var(--teal-glow);background:rgba(62,205,198,.1)}
.qz__opts button.act{background:var(--teal);border-color:var(--teal);color:#fff;font-weight:600}
.qz__res{text-align:center}
.qz__res h3{font-size:1.8rem;margin-bottom:.5rem}
.qz__hl{color:var(--teal-glow)}
.qz__desc{opacity:.9;margin-bottom:1.5rem}
.qz__reset{background:none;border:none;color:var(--teal-glow);font-family:var(--font-outfit),sans-serif;
  font-size:.9rem;cursor:pointer;margin-top:1rem;text-decoration:underline;padding:.5rem}

/* ── 6 DESPRE DANIELA ── */
.ab{background:var(--ow);padding:5rem 0}
.ab__in{display:flex;flex-direction:column;align-items:center;gap:2.5rem;max-width:900px;margin:0 auto}
.ab__circle{width:200px;height:200px;border-radius:50%;
  background:linear-gradient(135deg,var(--teal) 0%,var(--teal-glow) 100%);opacity:.25}
.ab__txt h2{text-align:left;margin-bottom:1rem}
.ab__txt p{font-size:1.05rem;margin-bottom:1.5rem;max-width:520px}
.ab__creds{display:flex;flex-direction:column;gap:.5rem;margin-bottom:1.5rem}
.ab__creds span{font-size:.95rem;font-weight:500}
.ab__ig{color:var(--teal-deep);font-weight:600;text-decoration:none;transition:color .2s}
.ab__ig:hover{color:var(--teal-dark)}

/* ── 7 MANIFEST ── */
.man{background:linear-gradient(160deg,var(--dark) 0%,#1a3a3a 100%);color:var(--ow);padding:6rem 0}
.man__txt{text-align:center}
.man__txt p{font-family:var(--font-cormorant),Georgia,serif;font-style:italic;
  font-size:clamp(1.4rem,3.5vw,2.4rem);font-weight:400;margin-bottom:1rem;line-height:1.4;opacity:1}

/* ── 8 FAQ ── */
.fq{background:var(--ow);padding:5rem 0}
.fq__list{max-width:700px;margin:0 auto}
.fq__i{border-bottom:1px solid #e4e8e8}
.fq__q{width:100%;background:none;border:none;display:flex;justify-content:space-between;
  align-items:center;padding:1.2rem 0;font-family:var(--font-outfit),sans-serif;
  font-size:1.05rem;font-weight:500;color:var(--dark);cursor:pointer;text-align:left;gap:1rem}
.fq__q span{font-size:1.4rem;color:var(--teal);flex-shrink:0;width:1.5rem;text-align:center}
.fq__a{max-height:0;overflow:hidden;transition:max-height .35s ease,padding .35s ease}
.fq__i--o .fq__a{max-height:200px;padding-bottom:1.2rem}
.fq__a p{font-size:.95rem;opacity:.8;line-height:1.7}

/* ── 9 FOOTER ── */
.ft{background:var(--dark);color:var(--ow);padding:4rem 0 2rem;text-align:center}
.ft__cta{font-family:var(--font-cormorant),Georgia,serif;font-size:clamp(1.3rem,3vw,2rem);
  font-weight:600;margin-bottom:2rem;line-height:1.4}
.ft__links{display:flex;justify-content:center;gap:2rem;margin:2.5rem 0}
.ft__links a{color:var(--teal-glow);text-decoration:none;font-size:.9rem;transition:opacity .2s}
.ft__links a:hover{opacity:.7}
.ft__disc{font-size:.75rem;opacity:.4;max-width:600px;margin:1.5rem auto .75rem;line-height:1.5}
.ft__copy{font-size:.8rem;opacity:.5}

/* ── WHATSAPP FLOAT ── */
.wa-float{position:fixed;bottom:24px;right:24px;z-index:999;width:56px;height:56px;
  border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;
  box-shadow:0 4px 15px rgba(37,211,102,.4);transition:transform .2s,box-shadow .2s}
.wa-float:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(37,211,102,.5)}

/* ── RESPONSIVE ── */
@media(max-width:639px){
  .wa-float{bottom:16px;right:16px;width:48px;height:48px}
  .wa-float svg{width:24px;height:24px}
}
@media(min-width:640px){
  .rec__g{grid-template-columns:1fr 1fr}
}
@media(min-width:768px){
  .cn__nav{display:flex}
  .ab__in{flex-direction:row}
  .ab__txt h2{text-align:left}
}
@media(min-width:1024px){
  .pk__g{grid-template-columns:1fr 1fr 1fr}
  .pk__c--tr{transform:scale(1.03)}
  .pk__c--tr:hover{transform:scale(1.03) translateY(-4px)}
}
`;
