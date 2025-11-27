"use client";

import * as React from "react";
import {
  IconGavel,
  IconShield,
  IconFileText,
  IconCreditCard,
  IconHome,
  IconCar,
  IconDashboard,
  IconInnerShadowTop,
  IconSettings,
  IconAlertTriangle,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Answer Lawsuit",
      url: "/answer-lawsuit",
      icon: IconGavel,
    },
    {
      title: "Collection Letters",
      url: "/collection-letters",
      icon: IconShield,
    },
    {
      title: "Credit Report Scan",
      url: "/credit-report-scan",
      icon: IconCreditCard,
    },
    {
      title: "Remove Inquiries",
      url: "/remove-inquiries",
      icon: IconAlertTriangle,
    },
    {
      title: "Mortgage Issues",
      url: "/mortgage-issues",
      icon: IconHome,
    },
    {
      title: "Repossession",
      url: "/repossession",
      icon: IconCar,
    },
    {
      title: "FDCPA Violation Detection",
      url: "/fdcpa-violation",
      icon: IconFileText,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5! border bg-primary hover:bg-primary/90 "
            >
              <span className="text-white hover:text-white text-center font-semibold">
                IAMPROSAY.
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
