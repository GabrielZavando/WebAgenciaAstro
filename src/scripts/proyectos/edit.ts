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
        const users = await apiClient.get('/clients/assignable') as any[]
        
        // Ordenar: admins primero, luego clientes
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

        const projectData = await apiClient.get(`/projects/${id}`)
        const project = projectData as any
        
        const nameInput = document.getElementById('projectName')
        if (nameInput instanceof HTMLInputElement) {
          nameInput.value = project.name
        }
        
        // El backend usa clientId
        clientSelect.value = project.clientId || ''
        
        const statusInput = document.getElementById('projectStatus')
        if (statusInput instanceof HTMLSelectElement) {
          statusInput.value = project.status || 'pending'
        }

        const percentInput = document.getElementById('projectPercentage')
        if (percentInput instanceof HTMLInputElement) {
          percentInput.value = String(project.percentage || 0)
        }

        // Nuevo campo: Límite de tickets
        const limitInput = document.getElementById('monthlyTicketLimit')
        if (limitInput instanceof HTMLInputElement) {
          limitInput.value = String(project.monthlyTicketLimit || 3)
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
      
      const updateData = {
        name: data.name as string,
        clientId: data.clientId as string,
        status: data.status as string,
        percentage: Number(data.percentage),
        monthlyTicketLimit: Number(data.monthlyTicketLimit),
        description: data.description as string
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
