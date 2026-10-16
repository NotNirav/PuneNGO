"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/lib/admin/authActions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="mt-4 flex flex-col gap-3">
      <div>
        <label htmlFor="username" className="text-sm font-semibold text-ink">
          Username
        </label>
        <Input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          autoFocus
          placeholder="pccoeadmin"
          defaultValue="pccoeadmin"
          aria-invalid={!!state.error}
          className="mt-1"
        />
      </div>

      <div>
        <label htmlFor="password" className="text-sm font-semibold text-ink">
          Password
        </label>
        <div className="relative mt-1">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "login-error" : undefined}
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:bg-ice"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {state.error && (
        <p id="login-error" role="alert" className="text-sm text-red-600 font-medium">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending && <Loader2 className="animate-spin size-4" aria-hidden />} Sign in
      </Button>
    </form>
  );
}
