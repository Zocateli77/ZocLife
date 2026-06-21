import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ZFlowMark } from "@/components/shell/z-flow-logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card accent="teal" className="w-full max-w-md">
        <CardContent className="flex flex-col items-center pt-6 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-teal/10">
            <ZFlowMark size={34} />
          </div>
          <Eyebrow className="mb-2">Erro 404</Eyebrow>
          <h1 className="font-heading text-xl font-bold">Página não encontrada</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            O caminho que você seguiu não leva a lugar nenhum por aqui.
          </p>
          <Link href="/" className={`${buttonVariants()} mt-6`}>
            Voltar ao painel
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
