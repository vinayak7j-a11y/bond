import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { HomeHero } from "@/components/HomeHero";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return <HomeHero />;
}
