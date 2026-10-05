"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { savedQuestionsKey } from "../domain/play-session";
import {
  parseStoredSavedIds,
  savedQuestionIds,
  type SavedQuestionCommand,
} from "../domain/saved-questions";

async function serverSavedIds(command?: SavedQuestionCommand) {
  const response = await fetch(
    "/api/account/saved-questions",
    command
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(command),
          cache: "no-store",
        }
      : { cache: "no-store" },
  );
  if (!command && response.status === 401) return null;
  if (!response.ok)
    throw new Error(`Saved questions request failed (${response.status}). Please try again.`);
  const result: unknown = await response.json();
  if (!result || typeof result !== "object" || !("ids" in result))
    throw new Error("Invalid saved questions response.");
  if (!Array.isArray(result.ids)) throw new Error("Invalid saved questions response.");
  return result.ids.map((id) => savedQuestionIds.element.parse(id));
}
function localIds() {
  let serialized: string;
  try {
    serialized = localStorage.getItem(savedQuestionsKey) ?? "[]";
  } catch (cause) {
    throw new Error(
      "Saved questions are unavailable in this browser. Your stored data has not been changed.",
      { cause },
    );
  }
  try {
    return parseStoredSavedIds(serialized);
  } catch (cause) {
    throw new Error("Saved questions could not be read. Your stored data has not been changed.", {
      cause,
    });
  }
}

/** Account results never enter guest storage. Import is additive and removed locally only after acknowledgement. */
export function useSavedQuestions(authEnabled = true) {
  const [savedIds, setSavedIds] = useState<string[] | null>(null);
  const [notice, setNotice] = useState("");
  const authenticated = useRef(false);
  const queue = useRef(Promise.resolve());
  const active = useRef(true);
  const refresh = useCallback(async () => {
    try {
      const remote = authEnabled ? await serverSavedIds() : null;
      authenticated.current = remote !== null;
      if (remote === null) {
        const ids = localIds();
        if (active.current) {
          setSavedIds(ids);
          setNotice("");
        }
        return;
      }
      // A corrupt/blocked local store must not prevent use of the account library.
      let ids = remote;
      let importNotice = "";
      try {
        const local = localIds();
        if (local.length) {
          ids = (await serverSavedIds({ action: "import", ids: local })) ?? remote;
          const acknowledged = new Set(local);
          const remaining = localIds().filter((id) => !acknowledged.has(id));
          localStorage.setItem(savedQuestionsKey, JSON.stringify(remaining));
        }
      } catch {
        importNotice =
          "Browser favorites could not be imported. Your stored data has not been changed. Account favorites remain available; retry by reloading.";
      }
      if (active.current) {
        setSavedIds(ids);
        setNotice(importNotice);
      }
    } catch (error) {
      if (active.current) {
        setSavedIds(null);
        setNotice(
          error instanceof Error
            ? error.message
            : "Saved questions are unavailable. Your stored data has not been changed.",
        );
      }
    }
  }, [authEnabled]);
  useEffect(() => {
    active.current = true;
    const read = () => {
      queue.current = queue.current.then(refresh);
    };
    read();
    window.addEventListener("focus", read);
    window.addEventListener("storage", read);
    return () => {
      active.current = false;
      window.removeEventListener("focus", read);
      window.removeEventListener("storage", read);
    };
  }, [refresh]);
  const change = (id: string, toggle: boolean) => {
    queue.current = queue.current.then(async () => {
      try {
        // Re-read server ownership before mutation; session expiry never falls back to a guest write.
        const remote = authEnabled ? await serverSavedIds() : null;
        if (authenticated.current && remote === null)
          throw new Error("Sign in again to update account favorites.");
        const current = remote ?? localIds();
        const remove = !toggle || current.includes(id);
        const next =
          remote !== null
            ? await serverSavedIds(remove ? { action: "remove", id } : { action: "save", id })
            : remove
              ? current.filter((stored) => stored !== id)
              : [...current, id];
        if (next === null) throw new Error("Saved questions response is unavailable.");
        if (remote === null) localStorage.setItem(savedQuestionsKey, JSON.stringify(next));
        if (active.current) {
          setSavedIds(next);
          setNotice("");
        }
      } catch (error) {
        if (active.current)
          setNotice(
            error instanceof Error
              ? error.message
              : "Could not update saved questions. Nothing was changed.",
          );
      }
    });
  };
  return {
    savedIds,
    notice,
    toggleSaved: (id: string) => change(id, true),
    removeSaved: (id: string) => change(id, false),
  };
}
