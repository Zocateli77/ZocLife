import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shell/theme-toggle";

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-bold">Configurações</h2>
        <p className="text-sm text-muted-foreground">Preferências do Zoc Life</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Aparência</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <span className="text-sm">Tema dark / light</span>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Automação diária</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>E-mail matinal</span>
            <Badge variant="success">Ativo</Badge>
          </div>
          <p className="text-muted-foreground">Horário: 08:00 (America/Sao_Paulo)</p>
          <p className="text-muted-foreground">Canal: Gmail</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Conta</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Zoc Life v0.1.0</p>
          <p className="mt-1">Usuário único · ZocLabs</p>
        </CardContent>
      </Card>
    </div>
  );
}
