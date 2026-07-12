import { SiteHeader } from "@/components/header/siteHeader";
import { SiteFooter } from "@/components/header/siteFooter";
import { getToken } from "@/lib/getToken";

export default async function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();

  return (
    <>
      <SiteHeader token={token} />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <SiteFooter />
    </>
  );
}
