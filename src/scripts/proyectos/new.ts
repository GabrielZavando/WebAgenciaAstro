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
        const clientsData = await apiClient.get('/clients')
        const clients = clientsData as Client[]
        clients.forEach(client => {
          const option = document.createElement('option')
          option.value = client.uid || client.id
          option.textContent = client.displayName || client.email
          clientSelect.appendChild(option)
        })
      } catch (err) {
        console.error('Error cargando clientes:', err)
      }
    }

    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault()
      const submitBtn = document.getElementById('submitBtn')
      if (!(submitBtn instanceof HTMLButtonElement)) return
      submitBtn.disabled = true

      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())
      
      const projectData: Partial<Project> = {
        ...data,
        status: 'pending',
        percentage: 0
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
