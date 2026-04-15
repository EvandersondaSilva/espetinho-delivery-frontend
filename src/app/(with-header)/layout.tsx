import { SiteHeader } from "@/components/ui/siteHeader";

export default function WithHeaderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </>
  );
}
