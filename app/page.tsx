import { redirect } from "next/navigation";

import { siteConfig } from "@/lib/site-config";

export default function Home() {
  redirect(`/${siteConfig.defaultLocale}`);
}