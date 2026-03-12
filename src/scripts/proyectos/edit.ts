import { apiClient } from "../../lib/api-client"
import type { Client, Project } from "../../types/projects"

export const initEditProject = async () => {
  const container = document.querySelector('.project-form-container')
  const form = document.getElementById('editProjectForm')
  const clientSelect = document.getElementById('projectClient')

  if (
    container instanceof HTMLElement && 
    form instanceof HTMLFormElement && 
    clientSelect instanceof HTMLSelectElement
  ) {
    const id = container.dataset.projectId

    const loadInitialData = async () => {
      try {
        const clientsData = await apiClient.get('/clients')
        const clients = clientsData as Client[]
        clients.forEach(client => {
          const option = document.createElement('option')
          option.value = client.uid || client.id
          option.textContent = client.displayName || client.email
          clientSelect.appendChild(option)
        })

        const projectData = await apiClient.get(`/projects/${id}`)
        const project = projectData as Project
        
        const nameInput = document.getElementById('projectName')
        if (nameInput instanceof HTMLInputElement) {
          nameInput.value = project.name
        }
        
        clientSelect.value = project.clientUid || ''
        
        const statusInput = document.getElementById('projectStatus')
        if (statusInput instanceof HTMLSelectElement) {
          statusInput.value = project.status || 'pending'
        }

        const percentInput = document.getElementById('projectPercentage')
        if (percentInput instanceof HTMLInputElement) {
          percentInput.value = String(project.percentage || 0)
        }

        const descInput = document.getElementById('projectDescription')
        if (descInput instanceof HTMLTextAreaElement) {
          descInput.value = project.description || ''
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      }
    }

    form.addEventListener('submit', async (e: Event) => {
      e.preventDefault()
      const saveBtn = document.getElementById('saveBtn')
      if (!(saveBtn instanceof HTMLButtonElement)) return
      saveBtn.disabled = true

      const formData = new FormData(form)
      const data = Object.fromEntries(formData.entries())
      const updateData: Partial<Project> = {
        ...data,
        percentage: Number(data.percentage)
      }

      try {
        await apiClient.patch(`/projects/${id}`, updateData)
        const win = window as any
        if (win.showToast) {
          win.showToast('¡Proyecto actualizado!', 'success')
        }
        setTimeout(() => {
          window.location.href = '/admin/proyectos'
        }, 1500)
      } catch (err: any) {
        const win = window as any
        if (win.showToast) {
          win.showToast(err.message || 'Error', 'error')
        }
        saveBtn.disabled = false
      }
    })

    loadInitialData()
  }
}
