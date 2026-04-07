import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AdminPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const name = session?.user?.name || "Admin";

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className="font-serif text-3xl font-bold mb-1"
            style={{ color: "#C9A84C" }}
          >
            Change Your Body
          </h1>
          <p className="text-sm text-gray-400">Panou administrare</p>
        </div>

        <div
          className="rounded-2xl p-7 border"
          style={{
            background: "#141e29",
            borderColor: "rgba(201,168,76,0.15)",
          }}
        >
          <h2 className="text-xl font-semibold text-white mb-2">
            Bine ai venit, {name}!
          </h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Panoul de administrare este in curs de dezvoltare. Vei putea
            gestiona aici clienții, abonamentele, conținutul și logurile.
          </p>
        </div>
      </div>
    </div>
  );
}
