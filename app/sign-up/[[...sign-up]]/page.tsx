import { SignUp } from "@clerk/nextjs";
import { ReferralParamCapture } from "@/components/ReferralParamCapture";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <ReferralParamCapture />
      <SignUp />
    </main>
  );
}
