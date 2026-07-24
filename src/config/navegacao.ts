import {
  Home,
  Library,
  LayoutTemplate,
  Smartphone,
  Settings,
  Tv,
  type LucideIcon,
} from "lucide-react";

export type ItemNavegacao = {
  titulo: string;
  /** Usado na barra inferior do mobile, onde não cabe o título completo. */
  tituloCurto: string;
  href: string;
  icone: LucideIcon;
  descricao: string;
};

/** Fonte única da navegação do painel — sidebar e menu mobile leem daqui. */
export const navegacaoPainel: ItemNavegacao[] = [
  {
    titulo: "Home",
    tituloCurto: "Home",
    href: "/painel",
    icone: Home,
    descricao: "Resumo da operação da academia",
  },
  {
    titulo: "Biblioteca de Treinos",
    tituloCurto: "Treinos",
    href: "/painel/treinos",
    icone: Library,
    descricao: "Todos os treinos cadastrados",
  },
  {
    titulo: "Templates",
    tituloCurto: "Templates",
    href: "/painel/templates",
    icone: LayoutTemplate,
    descricao: "Modelos prontos para começar rápido",
  },
  {
    titulo: "Controle pelo Celular",
    tituloCurto: "Controle",
    href: "/painel/controle",
    icone: Smartphone,
    descricao: "Comande a TV pelo celular",
  },
  {
    titulo: "Patrocinadores",
    tituloCurto: "Patrocínio",
    href: "/painel/patrocinadores",
    icone: Tv,
    descricao: "Mídia exibida na tela da TV",
  },
  {
    titulo: "Configurações",
    tituloCurto: "Ajustes",
    href: "/painel/configuracoes",
    icone: Settings,
    descricao: "Preferências da unidade e das telas",
  },
];
