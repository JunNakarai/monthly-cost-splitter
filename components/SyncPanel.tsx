"use client";

import type { FirebaseUser } from "@/lib/firebase";

type SyncPanelProps = {
  isConfigured: boolean;
  user: FirebaseUser | null;
  status: string;
  onSignIn: () => void;
  onSignOut: () => void;
};

export function SyncPanel({
  isConfigured,
  user,
  status,
  onSignIn,
  onSignOut,
}: SyncPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            サーバー保存
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isConfigured
              ? user
                ? `${user.email ?? "Googleアカウント"} で同期中`
                : "GoogleログインするとFirestoreに保存します。"
              : "Firebase設定を追加するとGoogleログインを使えます。"}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">{status}</p>
        </div>

        {isConfigured && (
          <div>
            {user ? (
              <button
                type="button"
                onClick={onSignOut}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                ログアウト
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Googleでログイン
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
