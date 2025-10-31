import type { Metadata } from "next";
import { LoginPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Log In - FlowCraft",
  description: "Log in to your FlowCraft account to manage your projects.",
};

export default function LoginPage() {
  return <LoginPageClient />;
}
