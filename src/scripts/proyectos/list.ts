import { apiClient } from "../../lib/api-client"
import type { Client, Project } from "../../types/projects"

let projects: Project[] = []
let clients: Client[] = []
let projectToDelete: string | null = null

export const initProjectList = async () => {
  const listBody = document.getElementById('projectsListBody')
  
  const loadData = async () => {
    try {
      clients = await apiClient.get('/clients') as Client[]
      projects = await apiClient.get('/projects') as Project[]
      renderProjects()
    } catch (err) {
      console.error('Error cargando proyectos:', err)
      if (listBody) {
        listBody.innerHTML = '<tr><td colspan="4">' +
          '<div class="error-state">Error al cargar proyectos.</div>' +
          '</td></tr>'
      }
    }
  }

  const renderProjects = () => {
    if (!(listBody instanceof HTMLElement)) return

    if (projects.length === 0) {
      listBody.innerHTML = `
        <tr>
          <td colspan="4">
            <div class="empty-state">
              <span class="material-symbols-outlined">folder_open</span>
              <p>No hay proyectos activos todavía.</p>
              <a href="/admin/proyectos/nuevo" 
                 class="btn btn-cta outline btn-sm" 
                 style="margin-top: 1.5rem;">
                Crear el primer proyecto
              </a>
            </div>
          </td>
        </tr>
      `
      return
    }

    listBody.innerHTML = projects.map(project => {
      const client = clients.find(c => (c.uid || c.id) === project.clientUid)
      const clientName = client ? 
        (client.displayName || client.email) : 'Sin cliente'

      return `
        <tr class="project-row">
          <td data-label="Nombre">
            <div class="project-name-cell">${project.name}</div>
          </td>
          <td data-label="Cliente">
            <div class="client-name-cell">${clientName}</div>
          </td>
          <td data-label="Descripción">
            <div class="description-cell" title="${project.description || ''}">
              ${project.description || 'Sin descripción'}
            </div>
          </td>
          <td data-label="Acciones">
            <div class="td-actions">
              <a href="/admin/proyectos/${project.id}" class="btn-details" title="Ver detalles">
                <span class="material-symbols-outlined">visibility</span>
                <span class="btn-text">Ver</span>
              </a>
              <button class="btn-icon del-btn" data-id="${project.id}" title="Eliminar proyecto">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </td>
        </tr>
      `
    }).join('')

    // Implementación de Búsqueda
    const searchInput = document.getElementById('projectSearch') as HTMLInputElement;
    searchInput?.addEventListener('input', () => {
      const term = searchInput.value.toLowerCase();
      const rows = listBody.querySelectorAll('.project-row');
      rows.forEach(row => {
        const name = row.querySelector('.project-name-cell')?.textContent?.toLowerCase() || '';
        const client = row.querySelector('.client-name-cell')?.textContent?.toLowerCase() || '';
        if (name.includes(term) || client.includes(term)) {
          (row as HTMLElement).style.display = '';
        } else {
          (row as HTMLElement).style.display = 'none';
        }
      });
    });

    listBody.querySelectorAll('.del-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget
        if (!(target instanceof HTMLElement)) return
        
        const id = target.getAttribute('data-id')
        projectToDelete = id
        
        const win = window as any
        if (win.confirmModalHelpers) {
          win.confirmModalHelpers.open('deleteProjectConfirm', async () => {
            if (projectToDelete) {
              try {
                await apiClient.delete(`/projects/${projectToDelete}`)
                if (win.showToast) win.showToast('Proyecto eliminado', 'success')
                loadData()
                projectToDelete = null
              } catch (error: any) {
                if (win.showToast) {
                  win.showToast(error.message || 'Error', 'error')
                }
              }
            }
          })
        }
      })
    })
  }

  loadData()
}
