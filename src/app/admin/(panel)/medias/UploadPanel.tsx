"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Uploader } from "@/components/admin/MediaLibrary";

export function MediaUploadPanel() {
  const router = useRouter();
  const [count, setCount] = useState(0);
  return (
    <div>
      <Uploader
        onUploaded={() => {
          setCount((c) => c + 1);
          router.refresh();
        }}
      />
      {count > 0 && <p className="a-ok" style={{ marginTop: "0.5rem" }}>{count} fichier(s) ajouté(s). Pensez à compléter leur description.</p>}
    </div>
  );
}
