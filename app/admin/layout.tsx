import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login?redirect=/admin");
  }

  // Check admin role
  const user = session.user as { role?: string };
  if (user.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
