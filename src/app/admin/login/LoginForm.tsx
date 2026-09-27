"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/lib/admin-actions";

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, { error: null });

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state.error && (
        <p className="rounded-sm border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-ink-700">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded-sm border border-ink-950/15 bg-paper-100 px-3 py-2.5 text-sm text-ink-950 outline-none focus:border-unipi-500"
        />
      </label>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-unipi-500 px-6 py-3 text-sm font-medium text-paper-50 transition hover:bg-unipi-600 disabled:opacity-60"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      Entra
    </button>
  );
}
