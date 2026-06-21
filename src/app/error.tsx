"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card accent="amber" className="w-full max-w-md">
        <CardContent className="flex flex-col items-center pt-6 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber/15 text-amber">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <Eyebrow className="mb-2">Erro inesperado</Eyebrow>
          <h1 className="font-heading text-xl font-bold">
            Algo não saiu como esperado
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tente novamente. Se persistir, recarregue a página.
          </p>
          {error.digest && (
            <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground/70">
              ref · {error.digest}
            </p>
          )}
          <Button onClick={() => unstable_retry()} className="mt-6">
            <RotateCcw className="h-4 w-4" />
            Tentar de novo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
