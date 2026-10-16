import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-card bg-white p-7 shadow-soft">
        <p className="font-display text-2xl font-extrabold">
          NGO<span className="text-cobalt">Connect</span> <span className="text-muted">Studio</span>
        </p>
        <h1 className="mt-4 text-xl">Sign in</h1>
        <p className="mt-1 text-xs text-muted">
          Default test login: <code className="font-semibold text-ink">pccoeadmin</code> · Password: <code className="font-semibold text-ink">admin@123</code>
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
