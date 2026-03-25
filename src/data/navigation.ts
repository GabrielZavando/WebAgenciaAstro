export interface NavItem {
  label: string;
  href?: string;
  icon: string;
  children?: NavItem[];
}

export const adminNav: NavItem[] = [
  { label: 'Inicio', href: '/admin', icon: 'home' },
  { label: 'Proyectos', href: '/admin/proyectos', icon: 'task' },
  { label: 'Usuarios', href: '/admin/usuarios', icon: 'group' },
  { label: 'Archivos', href: '/admin/archivos', icon: 'folder_open' },
  { label: 'Suscriptores', href: '/admin/suscriptores', icon: 'mail' },
  { label: 'Contacto', href: '/admin/contacto', icon: 'contacts' },
  { 
    label: 'Blog', 
    icon: 'edit_note',
    children: [
      { label: 'Artículos', href: '/admin/blog', icon: 'description' },
      { label: 'Categorías', href: '/admin/blog/categorias', icon: 'label' },
    ]
  },
  { label: 'Tickets', href: '/admin/tickets', icon: 'confirmation_number' },
  { label: 'Informes', href: '/admin/informes', icon: 'picture_as_pdf' },
  { label: 'Ideas', href: '/admin/ideas', icon: 'lightbulb' },
  { label: 'Estilos', href: '/admin/estilos', icon: 'palette' },
];

export const clientNav: NavItem[] = [
  { label: 'Inicio', href: '/dashboard', icon: 'home' },
  { label: 'Proyectos', href: '/dashboard/proyectos', icon: 'task' },
  { label: 'Informes', href: '/dashboard/informes', icon: 'picture_as_pdf' },
  { label: 'Archivos', href: '/dashboard/archivos', icon: 'folder_open' },
  { label: 'Soporte', href: '/dashboard/soporte', icon: 'support_agent' },
  { label: 'Herramientas', href: '/dashboard/herramientas', icon: 'build' },
];

export const getNavGroup = (role: 'admin' | 'client') => role === 'admin' ? adminNav : clientNav;
