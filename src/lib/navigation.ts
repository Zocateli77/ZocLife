import {
  LayoutDashboard,
  Calendar,
  Kanban,
  Target,
  Dumbbell,
  BookOpen,
  Video,
  FolderKanban,
  ClipboardList,
  Trophy,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  /** Short label for compact contexts (mobile bottom nav). Falls back to title. */
  shortTitle?: string;
  href: string;
  icon: LucideIcon;
  description?: string;
};

export const mainNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Visão geral do seu dia",
  },
  {
    title: "Calendário",
    href: "/calendario",
    icon: Calendar,
    description: "Agenda e compromissos",
  },
  {
    title: "Tarefas",
    href: "/tarefas",
    icon: Kanban,
    description: "Kanban e lista de tarefas",
  },
  {
    title: "Hábitos",
    href: "/habitos",
    icon: Target,
    description: "Metas e consistência",
  },
  {
    title: "Treinos",
    href: "/treinos",
    icon: Dumbbell,
    description: "Plano e execução física",
  },
  {
    title: "Estudos",
    href: "/estudos",
    icon: BookOpen,
    description: "Livros e aprendizados",
  },
  {
    title: "Conteúdo",
    href: "/conteudo",
    icon: Video,
    description: "Produção de vídeos",
  },
  {
    title: "Projetos",
    href: "/projetos",
    icon: FolderKanban,
    description: "Projetos pessoais",
  },
  {
    title: "Revisão Semanal",
    shortTitle: "Revisão",
    href: "/revisao",
    icon: ClipboardList,
    description: "Reflexão e planejamento",
  },
  {
    title: "Competindo comigo",
    shortTitle: "Ranking",
    href: "/gamificacao",
    icon: Trophy,
    description: "Pontuação e evolução",
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    description: "Preferências do app",
  },
];
