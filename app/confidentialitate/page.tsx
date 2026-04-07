import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de Confidențialitate — Change Your Body",
  description: "Politica de confidențialitate și prelucrare a datelor personale conform GDPR pentru platforma Change Your Body.",
};

export default function ConfidentialitatePage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", color: "#e0e0e0", fontFamily: "var(--font-outfit), system-ui, sans-serif", lineHeight: 1.8 }}>
      <h1 style={{ color: "#C9A84C", fontSize: 28, marginBottom: 4 }}>Politica de Confidențialitate</h1>
      <p style={{ color: "#888", fontSize: 13, marginBottom: 32 }}>Ultima actualizare: 7 aprilie 2026</p>

      <Section title="1. Cine suntem">
        <p>Operatorul datelor personale este <strong>Daniela Cioclov</strong>, care operează platforma Change Your Body (changeyourbody.ro).</p>
        <p>Contact: <strong>support@changeyourbody.ro</strong></p>
      </Section>

      <Section title="2. Ce date personale colectăm">
        <p>Colectăm următoarele categorii de date personale:</p>

        <h3 style={h3Style}>a) Date furnizate direct de dumneavoastră</h3>
        <ul style={ulStyle}>
          <li><strong>Date de identificare:</strong> nume, adresă de email</li>
          <li><strong>Date fizice și de sănătate:</strong> vârstă, greutate, înălțime, nivel de activitate fizică, obiectiv de fitness, moment de viață (postpartum, hormonal, etc.)</li>
          <li><strong>Date din chestionarul complet:</strong> preferințe alimentare, alergii, echipament disponibil, nivel de stres, informații despre ciclul menstrual, condiții medicale relevante</li>
          <li><strong>Date de plată:</strong> procesate exclusiv prin Stripe — noi NU stocăm datele cardului dumneavoastră</li>
        </ul>

        <h3 style={h3Style}>b) Date colectate automat</h3>
        <ul style={ulStyle}>
          <li><strong>Date de utilizare:</strong> pagini vizitate, interacțiuni cu chestionarul, via Google Analytics (doar cu consimțământ)</li>
          <li><strong>Date tehnice:</strong> tip de browser, sistem de operare, rezoluție ecran</li>
          <li><strong>Cookie-uri:</strong> vezi secțiunea dedicată mai jos</li>
        </ul>
      </Section>

      <Section title="3. Scopul prelucrării datelor">
        <p>Datele dumneavoastră sunt prelucrate pentru:</p>
        <ul style={ulStyle}>
          <li><strong>Furnizarea serviciilor:</strong> generarea planurilor alimentare și de antrenament personalizate, raportul metabolic, suport emoțional</li>
          <li><strong>Procesarea plăților:</strong> prin intermediul Stripe</li>
          <li><strong>Comunicări tranzacționale:</strong> confirmări de comandă, livrarea rapoartelor și planurilor achiziționate</li>
          <li><strong>Îmbunătățirea serviciilor:</strong> analiza agregată a utilizării platformei (doar cu consimțământ)</li>
          <li><strong>Obligații legale:</strong> conformitate fiscală și legală</li>
        </ul>
      </Section>

      <Section title="4. Temeiul legal al prelucrării">
        <ul style={ulStyle}>
          <li><strong>Consimțământ (Art. 6(1)(a) GDPR):</strong> pentru prelucrarea datelor din chestionar, trimiterea comunicărilor și utilizarea cookie-urilor analitice</li>
          <li><strong>Executarea contractului (Art. 6(1)(b) GDPR):</strong> pentru furnizarea serviciilor achiziționate</li>
          <li><strong>Interes legitim (Art. 6(1)(f) GDPR):</strong> pentru îmbunătățirea platformei și securitatea serviciilor</li>
          <li><strong>Obligație legală (Art. 6(1)(c) GDPR):</strong> pentru conformitate fiscală</li>
        </ul>
      </Section>

      <Section title="5. Date speciale (categorie specială)">
        <p>Anumite date colectate prin chestionar (date despre sănătate, ciclul menstrual) constituie date din categorii speciale conform Art. 9 GDPR. Aceste date sunt prelucrate exclusiv pe baza consimțământului dumneavoastră explicit, acordat la completarea chestionarului.</p>
        <p>Aceste date sunt utilizate exclusiv pentru personalizarea programului dumneavoastră și nu sunt partajate cu terți.</p>
      </Section>

      <Section title="6. Cu cine partajăm datele">
        <p>Datele dumneavoastră pot fi partajate cu:</p>
        <ul style={ulStyle}>
          <li><strong>Stripe</strong> — pentru procesarea plăților (Stripe Inc., SUA, conform clauze contractuale standard)</li>
          <li><strong>Resend</strong> — pentru trimiterea emailurilor tranzacționale (conform clauze contractuale standard)</li>
          <li><strong>Vercel</strong> — pentru hosting-ul platformei (Vercel Inc., SUA, conform clauze contractuale standard)</li>
          <li><strong>Google Analytics</strong> — pentru analiza agregată a utilizării (doar cu consimțământ, Google LLC, SUA)</li>
          <li><strong>Meta (Facebook Pixel)</strong> — pentru optimizarea campaniilor (doar cu consimțământ, Meta Platforms Inc., SUA)</li>
        </ul>
        <p>Nu vindem și nu partajăm datele dumneavoastră personale cu terți în scopuri de marketing.</p>
      </Section>

      <Section title="7. Transferuri internaționale">
        <p>Unii dintre procesatorii noștri sunt situați în SUA. Transferurile de date se efectuează pe baza:</p>
        <ul style={ulStyle}>
          <li>Clauzelor contractuale standard aprobate de Comisia Europeană</li>
          <li>Certificărilor de conformitate ale procesatorilor (unde este cazul)</li>
        </ul>
      </Section>

      <Section title="8. Cookie-uri">
        <p>Platforma utilizează:</p>
        <ul style={ulStyle}>
          <li><strong>Cookie-uri esențiale:</strong> necesare pentru funcționarea platformei (sesiune, preferințe). Nu necesită consimțământ.</li>
          <li><strong>Cookie-uri analitice (Google Analytics):</strong> pentru înțelegerea modului în care este utilizată platforma. Activate doar cu consimțământul dumneavoastră.</li>
          <li><strong>Cookie-uri de marketing (Facebook Pixel):</strong> pentru optimizarea campaniilor publicitare. Activate doar cu consimțământul dumneavoastră.</li>
        </ul>
        <p>Puteți gestiona preferințele privind cookie-urile oricând prin bannerul de consimțământ afișat la prima vizită.</p>
      </Section>

      <Section title="9. Durata stocării datelor">
        <ul style={ulStyle}>
          <li><strong>Date din chestionar:</strong> pe durata relației contractuale + 3 ani</li>
          <li><strong>Date de plată (referință Stripe):</strong> conform obligațiilor fiscale (minimum 5 ani)</li>
          <li><strong>Consimțământ GDPR:</strong> pe durată nedeterminată (necesar ca dovadă legală)</li>
          <li><strong>Date analitice:</strong> maxim 26 de luni (configurare Google Analytics)</li>
        </ul>
      </Section>

      <Section title="10. Drepturile dumneavoastră">
        <p>Conform GDPR, aveți următoarele drepturi:</p>
        <ul style={ulStyle}>
          <li><strong>Dreptul de acces</strong> — puteți solicita o copie a datelor dumneavoastră</li>
          <li><strong>Dreptul la rectificare</strong> — puteți corecta datele inexacte</li>
          <li><strong>Dreptul la ștergere</strong> — puteți solicita ștergerea datelor (cu excepția celor necesare legal)</li>
          <li><strong>Dreptul la restricționare</strong> — puteți solicita limitarea prelucrării</li>
          <li><strong>Dreptul la portabilitate</strong> — puteți primi datele într-un format structurat</li>
          <li><strong>Dreptul de opoziție</strong> — puteți obiecta la prelucrarea bazată pe interes legitim</li>
          <li><strong>Dreptul de retragere a consimțământului</strong> — oricând, fără a afecta legalitatea prelucrării anterioare</li>
        </ul>
        <p>Pentru exercitarea acestor drepturi, contactați-ne la: <strong>support@changeyourbody.ro</strong></p>
        <p>Aveți de asemenea dreptul de a depune o plângere la <strong>Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</strong> — dataprotection.ro</p>
      </Section>

      <Section title="11. Securitatea datelor">
        <p>Implementăm măsuri tehnice și organizatorice adecvate pentru protecția datelor dumneavoastră, inclusiv:</p>
        <ul style={ulStyle}>
          <li>Criptare HTTPS pentru toate conexiunile</li>
          <li>Procesarea plăților exclusiv prin Stripe (certificat PCI DSS)</li>
          <li>Acces limitat la datele personale (doar Daniela Cioclov)</li>
          <li>Cookie-uri de sesiune securizate (httpOnly, Secure, SameSite)</li>
        </ul>
      </Section>

      <Section title="12. Modificări ale politicii">
        <p>Ne rezervăm dreptul de a actualiza această politică. Modificările vor fi publicate pe această pagină cu data actualizării. Pentru modificări semnificative, vă vom notifica prin email.</p>
      </Section>

      <Section title="13. Contact">
        <p>Pentru orice întrebări privind protecția datelor personale:</p>
        <ul style={ulStyle}>
          <li>Email: <strong>support@changeyourbody.ro</strong></li>
          <li>WhatsApp: <strong>+40 721 333 040</strong></li>
          <li>Website: <strong>changeyourbody.ro</strong></li>
        </ul>
      </Section>

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", textAlign: "center" }}>
        <p style={{ color: "#555", fontSize: 12 }}>Change Your Body by Daniela Cioclov &middot; changeyourbody.ro</p>
        <p style={{ color: "#555", fontSize: 12 }}>
          <a href="/termeni" style={linkStyle}>Termeni și Condiții</a>
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

const h3Style: React.CSSProperties = { color: "#ccc", fontSize: 15, margin: "12px 0 4px" };
const ulStyle: React.CSSProperties = { paddingLeft: 20, margin: "8px 0" };
const linkStyle: React.CSSProperties = { color: "#C9A84C", textDecoration: "underline" };
