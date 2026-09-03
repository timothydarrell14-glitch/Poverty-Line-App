import { useEffect, useState } from "react";
import { apiUrl } from "../api/client";

export const defaultPublicSettings = {
  orgName: "Poverty Line Initiative",
  supportEmail: "support@povertyline.org",
  publicDescription: "# Dignity Through Efficiency",
};

export function usePublicSettings() {
  const [settings, setSettings] = useState(defaultPublicSettings);

  useEffect(() => {
    fetch(apiUrl("/api/auth/settings/public"))
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.settings) setSettings((current) => ({ ...current, ...data.settings }));
      })
      .catch(() => undefined);
  }, []);

  return settings;
}