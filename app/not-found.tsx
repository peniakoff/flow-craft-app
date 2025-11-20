import type { Metadata } from "next";
import { NotFoundClient } from "./not-found-client";

export const metadata: Metadata = {
  title: "Page Not Found - FlowCraft",
  description: "The page you are looking for could not be found.",
};

export default function NotFoundPage() {
  return <NotFoundClient />;
}
