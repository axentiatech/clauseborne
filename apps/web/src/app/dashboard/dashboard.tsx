"use client";

import FileUpload from "@/components/file-upload";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { data: projects } = useQuery(trpc.project.getById.queryOptions());
  return (
    <div>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(projects, null, 2)}</pre>

      <FileUpload />
    </div>
  );
}
