import FileUpload from "@/components/file-upload";
import { auth } from "@iam-pro-say/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // const session = await auth.api.getSession({
  //   headers: await headers(),
  // });

  // if (!session?.user) {
  //   redirect("/login");
  // }

  redirect("/dashboard/answer-lawsuit");
}
