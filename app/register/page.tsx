import type { Metadata } from "next";
import { RegisterPageClient } from "./page-client";

export const metadata: Metadata = {
  title: "Sign Up - FlowCraft",
  description: "Create a FlowCraft account to start managing your projects.",
};

export default function RegisterPage() {
  return <RegisterPageClient />;
}
