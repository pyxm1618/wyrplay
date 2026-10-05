"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/platform/auth/auth-client";

export function ProfileEditor({ name }: { name: string }) {
  const [value, setValue] = useState(name);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState("");
  const router = useRouter();
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const next = value.trim();
        if (!next || next.length > 100 || pending) return;
        setPending(true);
        setNotice("");
        try {
          const result = await authClient.updateUser({ name: next });
          if (result.error)
            throw new Error(result.error.message || "Could not save your display name.");
          setValue(next);
          setNotice("Display name saved.");
          router.refresh();
        } catch (error) {
          setNotice(
            error instanceof Error ? error.message : "Could not save your display name. Try again.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <label className="settings-field">
        <span>Display Name</span>
        <input
          value={value}
          required
          maxLength={100}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <button
        className="account-blue-button settings-save"
        disabled={pending || !value.trim() || value.trim() === name}
      >
        {pending ? "Saving…" : "Save Changes"}
      </button>
      {notice && <p role="status">{notice}</p>}
    </form>
  );
}
