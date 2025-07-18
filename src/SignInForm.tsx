"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function SignInForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="w-full fade-in">
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center shadow-lg border border-white/20 hover-lift">
          <div className="w-20 h-20 rounded-full bg-yellow-200 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
            <span className="text-4xl">🐕</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Welcome to CultureConnect!</h2>
          <p className="text-base text-white/80 text-center max-w-md mb-2">
            Hi, I'm <span className="font-semibold">Kandi</span> 🐕, your friendly cultural guide! I'll help you connect with amazing people through shared culture, values, and experiences. Sign up or log in to start your journey!
          </p>
        </div>
      </div>
      <form
        className="flex flex-col gap-form-field"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitting(true);
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData).catch((error) => {
            let toastTitle = "";
            if (error.message.includes("Invalid password")) {
              toastTitle = "Invalid password. Please try again.";
            } else {
              toastTitle =
                flow === "signIn"
                  ? "Could not sign in, did you mean to sign up?"
                  : "Could not sign up, did you mean to sign in?";
            }
            toast.error(toastTitle);
            setSubmitting(false);
          });
        }}
      >
        <input
          className="auth-input-field hover-glow"
          type="email"
          name="email"
          placeholder="Email"
          required
        />
        <input
          className="auth-input-field hover-glow"
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button 
          className={`auth-button hover-scale ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`} 
          type="submit" 
          disabled={submitting}
        >
          {submitting ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full spin-smooth"></div>
              <span>{flow === "signIn" ? "Signing in..." : "Signing up..."}</span>
            </span>
          ) : (
            flow === "signIn" ? "Sign in" : "Sign up"
          )}
        </button>
        <div className="text-center text-sm text-secondary">
          <span>
            {flow === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
          </span>
          <button
            type="button"
            className="text-primary hover:text-primary-hover hover:underline font-medium cursor-pointer hover-scale"
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          >
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </button>
        </div>
      </form>
      <div className="flex items-center justify-center my-3">
        <hr className="my-4 grow border-gray-200" />
        <span className="mx-4 text-secondary">or</span>
        <hr className="my-4 grow border-gray-200" />
      </div>
    </div>
  );
}
