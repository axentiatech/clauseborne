"use client";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import { useState } from "react";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return showSignIn ? (
    <div className="grid min-h-svh  lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full bg-background max-w-md">
            <SignUpForm onSwitchToSignIn={() => setShowSignIn(false)} />
          </div>
        </div>
      </div>
      <div className="bg-muted/30 relative hidden lg:flex items-center justify-center">
        <div className="max-w-lg mx-auto px-8">
          <figure className="flex flex-col justify-between">
            <blockquote className="text-lg leading-relaxed text-foreground">
              <p>
                "Know your rights. Protect your credit. Fight back against
                unfair collection practices. With AI-powered legal tools, you
                don't have to navigate the legal system alone."
              </p>
            </blockquote>
            <figcaption className="mt-8 text-sm text-muted-foreground">
              Clauseborne — Your partner in consumer rights protection
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  ) : (
    <div className="grid min-h-svh bg-background lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignInForm onSwitchToSignUp={() => setShowSignIn(true)} />
          </div>
        </div>
      </div>
      <div className="bg-muted/30 relative hidden lg:flex items-center justify-center">
        <div className="max-w-lg mx-auto px-8">
          <figure className="flex flex-col justify-between">
            <blockquote className="text-lg leading-relaxed text-foreground">
              <p>
                "Your cases are waiting. Continue managing your legal documents,
                tracking violations, and protecting your consumer rights with
                confidence."
              </p>
            </blockquote>
            <figcaption className="mt-8 text-sm text-muted-foreground">
              Welcome back to Clauseborne
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  );
}
