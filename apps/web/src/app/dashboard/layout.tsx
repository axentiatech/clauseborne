import type { Metadata } from "next";
import "../../index.css";
import Providers from "@/components/providers";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// import { SiteHeader } from "@/components/site-header";
import { auth } from "@iam-pro-say/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const metadata: Metadata = {
  title: "iam-pro-say",
  description: "iam-pro-say",
};

const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return <>{children}</>;
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Providers>
        <AuthGuard>
          <SidebarProvider
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 62)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              {/* <SiteHeader /> */}
              <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </AuthGuard>
      </Providers>
    </div>
  );
}
