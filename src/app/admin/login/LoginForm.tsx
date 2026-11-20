"use client";

import { useActionState } from "react";
import { signIn } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, {});
  return (
    <form action={action} className="mt-6 grid gap-4">
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </div>
      {state.error ? <p role="alert" className="text-[#b3261e]">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn btn-primary justify-center">{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
