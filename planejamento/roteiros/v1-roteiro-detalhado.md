# Roteiro detalhado — V1: "Power Automate do zero: 3 fluxos simples pra parar de fazer trabalho manual"

**Formato:** YouTube 8–10 min · Mão na Massa · gravação de tela + câmera (intro/encerramento)
**Gravar:** sáb 27/jun · **Publicar:** dom 28/jun 10h
**Equip.:** mic clip-on/shotgun (áudio ruim mata retenção), gravação de tela 1080p, OBS/Clipchamp.
**Legenda:** queimar legenda (maioria assiste sem som no feed/Shorts).

> Convenções: **[CÂMERA]** você falando · **[TELA]** screencast · **(txt: …)** texto na tela · *itálico* = ação/observação de edição.

---

## BLOCO 0 — Gancho (0:00–0:30) · skip-rate
**[TELA]** *Abrir já com o "depois": um e-mail chegando e o anexo aparecendo sozinho numa pasta do SharePoint.*
**[CÂMERA/voz]:**
> "Esse e-mail aqui acabou de chegar… e o anexo já tá salvo na pasta certa. Eu não fiz nada. No fim desse vídeo você vai ter **3 automações** dessas rodando — e não vai escrever **uma linha de código**."

(txt: 3 fluxos · 0 código)
*Corte seco, sem vinheta longa. Energia alta nos 3 primeiros segundos.*

---

## BLOCO 1 — Contexto rápido (0:30–1:30)
**[CÂMERA]:**
> "Se você usa Outlook, Teams e SharePoint no trabalho, isso aqui é pra você. Power Automate é da Microsoft e provavelmente já tá na sua licença. E todo fluxo é a mesma ideia: **gatilho, condição e ação**."

(txt: Gatilho → Condição → Ação)
> "Quando rodar, só se acontecer tal coisa, e o que fazer. Guarda essa frase que o resto é detalhe. Bora pro primeiro."

*B-roll: tela inicial do make.powerautomate.com (com e-mail/tenant tarjado).*

---

## BLOCO 2 — Fluxo 1: Anexos de e-mail → SharePoint (1:30–4:30) · o carro-chefe
**[TELA]** passo a passo, falando por cima:
1. (txt: 1. Gatilho) "Criar → Fluxo de nuvem automatizado. Gatilho: **Quando um novo e-mail chegar (V3)**." *Mostrar onde escolher a pasta.*
2. (txt: 2. Condição) "Aqui o pulo do gato: nas opções avançadas, **Apenas com anexos = Sim**. Já filtra o que não interessa."
3. (txt: 3. Ação — SharePoint) "Nova ação: **Criar arquivo** no SharePoint. Escolhe o site e a pasta."
4. **Ponto crítico:** "Ao usar o conteúdo do anexo, o Power Automate cria sozinho um **Apply to each** — é o laço que percorre **cada** anexo. **Não apague isso.**" (txt: ⚠ Apply to each = vários anexos)
   - Nome do arquivo = `Attachments Name` · Conteúdo = `Attachments Content`.
5. (txt: testar) "Salvar → **Testar → Manualmente** → mando um e-mail com anexo pra mim mesmo." *Mostrar o arquivo aparecendo na pasta.*

**[CÂMERA] micro-recap:**
> "Olha só: e-mail entrou, anexo salvou. Esse é o fluxo que mais devolve tempo pra quem vive baixando arquivo na mão."

---

## BLOCO 3 — Fluxo 2: Alerta no Teams (4:30–6:30)
**[TELA]:**
1. (txt: gatilho) "Pode ser agendado ou por evento. Vou usar **item criado** numa lista do SharePoint/planilha — tipo uma nova solicitação."
2. (txt: ação — Teams) "Ação: **Postar mensagem em um chat ou canal**. Escolhe o time e o canal."
3. "Monto a mensagem com os **campos dinâmicos**: ‘Nova solicitação de [Nome] — prazo [Data]’." (txt: campos dinâmicos)
4. (txt: testar passo a passo) "Em 2026 dá pra **testar cada passo** com dados de exemplo — uso isso pra validar antes de confiar."

**[CÂMERA]:**
> "Pronto: a equipe é avisada sozinha. Ninguém mais depende de você lembrar de mandar mensagem."

---

## BLOCO 4 — Fluxo 3: Lembrete automático (6:30–7:30)
**[TELA]:**
1. (txt: gatilho — recorrência) "Fluxo de nuvem **agendado**: gatilho **Recorrência**, toda segunda às 8h."
2. (txt: ação) "Ação: enviar e-mail ou postar no Teams o checklist da semana."
3. "Simples, mas é o tipo de coisa que você esquece — e o robô não."

---

## BLOCO 5 — Recap + erros comuns (7:30–9:00)
**[CÂMERA]** *(pode ser sobre B-roll dos 3 fluxos):*
> "Recapitulando: 1) anexo de e-mail → SharePoint, 2) alerta no Teams, 3) lembrete recorrente. Todos com a mesma lógica: gatilho, condição, ação."

(txt: 3 erros de iniciante)
> "Três erros pra você não cair: **um** — apagar o Apply to each e perder anexos. **Dois** — não testar e só descobrir que quebrou na segunda de manhã. **Três** — apontar pra pasta errada do SharePoint. Confere sempre o caminho."

---

## BLOCO 6 — CTA + próximo passo (9:00–10:00)
**[CÂMERA]:**
> "Eu liberei a **documentação em português** desses fluxos, com print de cada passo — tá no link da descrição. Salva esse vídeo, e me conta nos comentários **qual tarefa manual** você vai automatizar primeiro."
> "Semana que vem eu pego o mesmo problema, mas com **Power Apps** — um app que manda anexos pro SharePoint. Tecnologia na prática. Tô fora!"

(txt: doc em PT na descrição · próximo: Power Apps)

---

## Pós-produção / reaproveitamento
- **Thumb:** "3 FLUXOS · 0 CÓDIGO" + print do e-mail→pasta (âmbar em "0 CÓDIGO").
- **Cortes verticais:** Bloco 2 → **R2** (fluxo que economiza 2h) · Bloco 3 → **R6** (alerta Teams).
- **Carrosséis:** C13 (a lógica), C14 (passo a passo dos anexos), C15 (alerta Teams).
- **LinkedIn:** "3 fluxos que devolvem horas por semana" + 1 print.
- **Doc-resumo público:** `docs/power-automate-3-fluxos/index.html` (já pronta) — link na descrição e no Notion.
- **Checklist de gravação:** [ ] mic testado [ ] tenant/e-mail tarjado [ ] zoom de tela legível [ ] legendas [ ] thumb [ ] doc linkada.
