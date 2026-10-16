import { KeyRound } from "lucide-react";

export function ServiceKeyNotice() {
  return (
    <div className="mx-auto max-w-xl rounded-card bg-white p-7 shadow-soft">
      <KeyRound className="size-8 text-cobalt" aria-hidden />
      <h1 className="mt-3 text-2xl">One more step: the service key</h1>
      <p className="mt-2 text-muted">
        The admin panel saves NGOs using Supabase&apos;s <strong>service role key</strong>. It isn&apos;t in{" "}
        <code>.env.local</code> yet.
      </p>
      <ol className="mt-4 list-decimal space-y-1.5 pl-5 text-[15px]">
        <li>Open your Supabase project → Project Settings → API Keys.</li>
        <li>
          Copy the <strong>service_role</strong> (secret) key.
        </li>
        <li>
          Paste it after <code>SUPABASE_SERVICE_ROLE_KEY=</code> in <code>.env.local</code>.
        </li>
        <li>Restart the dev server and refresh this page.</li>
      </ol>
      <p className="mt-4 text-sm text-muted">Never share this key or put it in a NEXT_PUBLIC_ variable.</p>
    </div>
  );
}
