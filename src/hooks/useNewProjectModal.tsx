import { useState } from "react"

type NewProjectModalTypes = {
  isOpen: boolean
  quoteId: number
  submissionById: number
  projectTypeId: number
  loading: boolean
}

/**
 * This hook is used to manage the state of the new project modal
 * @example
 * const { newProject, setNewProject } = useNewProjectModal()
 */
export const useNewProjectModal = () => {
  const defaultState: NewProjectModalTypes = {
    isOpen: false, quoteId: 0, loading: false, submissionById: 0,
    projectTypeId: 0
  }
  const [newProject, setNewProject] = useState<NewProjectModalTypes>(defaultState);

  return { newProject, setNewProject }
}