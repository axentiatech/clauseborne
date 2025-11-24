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
      title: "Dashboard",
      url: "/",
      icon: IconDashboard,
    },
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
              className="data-[slot=sidebar-menu-button]:p-1.5! border bg-gray-200 hover:bg-gray-300"
            >
              <a href="#">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base  font-semibold">IamProSay</span>
              </a>
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
