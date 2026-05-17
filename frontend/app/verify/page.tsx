import type { Metadata } from "next";
import { VERIFY_DESCRIPTION, VERIFY_SHORT_DESCRIPTION, VERIFY_TITLE, VERIFY_URL } from "../lib/site-metadata";
import VerifyPageClient from "./VerifyPageClient";

export const metadata: Metadata = {
  title: VERIFY_TITLE,
  description: VERIFY_DESCRIPTION,
  alternates: {
    canonical: VERIFY_URL,
  },
  openGraph: {
    title: VERIFY_TITLE,
    description: VERIFY_SHORT_DESCRIPTION,
    url: VERIFY_URL,
  },
  twitter: {
    card: "summary",
    title: VERIFY_TITLE,
    description: VERIFY_SHORT_DESCRIPTION,
  },
};

export default function VerifyPage() {
  return <VerifyPageClient />;
}
