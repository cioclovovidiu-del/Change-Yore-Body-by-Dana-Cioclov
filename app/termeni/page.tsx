import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții — Change Your Body",
  description: "Termenii și condițiile de utilizare a platformei Change Your Body by Daniela Cioclov.",
};

export default function TermeniPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", color: "#e0e0e0", fontFamily: "var(--font-outfit), system-ui, sans-serif", lineHeight: 1.8 }}>
      <h1 style={{ color: "#C9A84C", fontSize: 28, marginBottom: 4 }}>Termeni și Condiții</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Ultima actualizare: 7 aprilie 2026</p>

      <Section title="1. Informații generale">
        <p>Platforma <strong>Change Your Body</strong> (accesibilă la adresa changeyourbody.ro) este operată de Daniela Cioclov, cu sediul în România (denumită în continuare „Operatorul").</p>
        <p>Prin accesarea sau utilizarea platformei, inclusiv completarea chestionarului, achiziționarea unui pachet sau utilizarea oricăror funcționalități disponibile, confirmați că ați citit, ați înțeles și sunteți de acord cu acești Termeni și Condiții.</p>
      </Section>

      <Section title="2. Descrierea serviciilor">
        <p>Change Your Body oferă programe personalizate de fitness și nutriție pentru femei cu vârsta peste 35 de ani. Serviciile includ:</p>
        <ul style={ulStyle}>
          <li>Chestionar de evaluare inițială</li>
          <li>Plan alimentar personalizat (7 sau 30 de zile, în funcție de pachet)</li>
          <li>Program de antrenament personalizat (4 sau 12 săptămâni, în funcție de pachet)</li>
          <li>Raport metabolic personalizat</li>
          <li>Suport prin WhatsApp (în funcție de pachet)</li>
          <li>Coaching individual cu Daniela Cioclov (în funcție de pachet)</li>
        </ul>
      </Section>

      <Section title="3. Disclaimer medical">
        <p><strong>Programele Change Your Body au caracter exclusiv informativ și educațional. Ele NU înlocuiesc consultul medical, diagnosticul sau tratamentul oferit de un medic specialist.</strong></p>
        <p>Înainte de a începe orice program de exerciții fizice sau schimbare alimentară, consultați medicul dumneavoastră, în special dacă:</p>
        <ul style={ulStyle}>
          <li>Aveți afecțiuni cronice sau acute</li>
          <li>Sunteți însărcinată sau alăptați</li>
          <li>Luați medicamente care pot fi afectate de schimbări alimentare sau de efort fizic</li>
          <li>Aveți un istoric de tulburări alimentare</li>
        </ul>
        <p>Operatorul nu este medic și nu oferă sfaturi medicale. Utilizarea programelor se face pe propria răspundere a utilizatorului.</p>
      </Section>

      <Section title="4. Suportul emoțional">
        <p>Platforma poate include mesaje de suport emoțional generate pe baza profilului dumneavoastră. Aceste mesaje:</p>
        <ul style={ulStyle}>
          <li>NU constituie terapie psihologică sau consiliere</li>
          <li>NU înlocuiesc consultul cu un psiholog sau psihoterapeut</li>
          <li>NU sunt validate clinic</li>
        </ul>
        <p>Dacă simțiți că aveți nevoie de sprijin profesionist, vă încurajăm să contactați un specialist. Linia gratuită de suport emoțional: <strong>0800 801 200</strong> (gratuit, anonim).</p>
      </Section>

      <Section title="5. Plăți și rambursări">
        <p>Plățile se efectuează prin Stripe, un procesor de plăți securizat. Change Your Body nu stochează datele cardului dumneavoastră.</p>
        <p>Produsele digitale livrate (planuri alimentare, programe de antrenament, rapoarte) nu pot fi returnate conform legislației privind conținutul digital. Dacă întâmpinați probleme cu comanda, contactați-ne la adresa de email indicată mai jos.</p>
      </Section>

      <Section title="6. Proprietate intelectuală">
        <p>Tot conținutul platformei (texte, imagini, videoclipuri, planuri, programe, rapoarte, algoritmi de calcul) este proprietatea Operatorului și este protejat de legislația privind drepturile de autor.</p>
        <p>Este interzisă copierea, distribuirea, vânzarea sau republicarea oricărui conținut fără acordul scris prealabil al Operatorului.</p>
      </Section>

      <Section title="7. Protecția datelor personale">
        <p>Prelucrarea datelor personale se face în conformitate cu Regulamentul General privind Protecția Datelor (GDPR). Detalii complete sunt disponibile în <a href="/confidentialitate" style={linkStyle}>Politica de Confidențialitate</a>.</p>
      </Section>

      <Section title="8. Limitarea răspunderii">
        <p>Operatorul nu este responsabil pentru:</p>
        <ul style={ulStyle}>
          <li>Rezultatele individuale obținute prin urmarea programelor (rezultatele variază de la persoană la persoană)</li>
          <li>Prejudicii rezultate din nerespectarea indicațiilor medicale</li>
          <li>Întreruperi temporare ale platformei datorate mentenanței sau problemelor tehnice</li>
          <li>Utilizarea incorectă a informațiilor furnizate</li>
        </ul>
      </Section>

      <Section title="9. Comunicări electronice">
        <p>Prin completarea chestionarului și furnizarea adresei de email cu consimțământ GDPR, sunteți de acord să primiți comunicări legate de serviciul achiziționat (confirmări de comandă, rapoarte, planuri).</p>
        <p>Puteți renunța la comunicările de marketing oricând prin link-ul de dezabonare din orice email sau contactând Operatorul direct.</p>
      </Section>

      <Section title="10. Modificarea termenilor">
        <p>Operatorul își rezervă dreptul de a modifica acești Termeni și Condiții. Modificările vor fi publicate pe această pagină cu data actualizării. Utilizarea continuă a platformei după publicarea modificărilor constituie acceptarea noilor termeni.</p>
      </Section>

      <Section title="11. Legea aplicabilă">
        <p>Acești Termeni și Condiții sunt guvernați de legislația din România. Orice litigiu va fi soluționat de instanțele competente din România.</p>
      </Section>

      <Section title="12. Contact">
        <p>Pentru orice întrebări sau solicitări legate de acești termeni:</p>
        <ul style={ulStyle}>
          <li>Email: <strong>support@changeyourbody.ro</strong></li>
          <li>WhatsApp: <strong>+40 721 333 040</strong></li>
          <li>Website: <strong>changeyourbody.ro</strong></li>
        </ul>
      </Section>

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: 12 }}>Change Your Body by Daniela Cioclov &middot; changeyourbody.ro</p>
        <p style={{ color: "#555", fontSize: 12 }}>
          <a href="/confidentialitate" style={linkStyle}>Politica de Confidențialitate</a>
        </p>
      </footer>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ color: "#C9A84C", fontSize: 18, marginBottom: 8 }}>{title}</h2>
      {children}
    </section>
  );
}

const ulStyle: React.CSSProperties = { paddingLeft: 20, margin: "8px 0" };
const linkStyle: React.CSSProperties = { color: "#C9A84C", textDecoration: "underline" };
