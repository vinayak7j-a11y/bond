"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { captureReferralParam } from "./CaptureReferral";

// Runs on the sign-up page itself — well before an account exists — so a
// referral is captured even if the person closes the tab and completes
// signup a different day. The actual attribution to their new User row
// happens later, in CaptureReferral, once they're signed in.
export function ReferralParamCapture() {
  const params = useSearchParams();

  useEffect(() => {
    captureReferralParam(params.get("ref"));
  }, [params]);

  return null;
}
