import { apiClient } from "../../lib/api-client"
import type { Client, Project } from "../../types/projects"

export const initNewProject = async () => {
  const form = document.getElementById('newProjectForm')
  const clientSelect = document.getElementById('projectClient')

  if (
    form instanceof HTMLFormElement && 
    clientSelect instanceof HTMLSelectElement
  ) {
    const init = async () => {
      try {
        const users = await apiClient.get('/clients/assignable') as any[]
        
        // Ordenar: admins primero, luego clientes, luego por nombre
        users.sort((a, b) => {
          if (a.role === b.role) {
            return (a.displayName || '').localeCompare(b.displayName || '')
          }
          return a.role === 'admin' ? -1 : 1
        })

        users.forEach(user => {
          const option = document.createElement('option')
          option.value = user.uid || user.id
          const roleLabel = user.role === 'admin' ? '[Admin]' : '[Cliente]'
          option.textContent = `${roleLabel} ${user.displayName || user.email}`
          clientSelect.appendChild(option)
        })
      } catch (err) {
        console.error('Error cargando usuarios asignables:', err)
      }
    }

    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault()
      const submitBtn = document.getElementById('submitBtn')
      if (!(submitBtn instanceof HTMLButtonElement)) return
      submitBtn.disabled = true

      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())
      
      const projectData = {
        name: data.name as string,
        clientId: data.clientId as string,
        description: data.description as string,
        monthlyTicketLimit: Number(data.monthlyTicketLimit),
      }

      try {
        await apiClient.post('/projects', projectData)
        const win = window as any
        if (win.showToast) {
          win.showToast('¡Proyecto creado!', 'success')
        }
        
        setTimeout(() => {
          window.location.href = '/admin/proyectos'
        }, 1500)
      } catch (err: any) {
        const win = window as any
        if (win.showToast) {
          win.showToast(err.message || 'Error', 'error')
        }
        submitBtn.disabled = false
      }
    })

    init()
  }
}
