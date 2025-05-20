import * as Shared from './'

const NormalizeItemIds = (project, state, setData) => {
    const normalizedActivities = project.activities.map((item, index) => {
        const newBaseId = `${state.currentProject}.${index}`
        return Shared.UpdateItemAndChildrenIds(item, newBaseId)
    })

    const updatedProject = {
        ...project,
        activities: normalizedActivities
    }

    setData({ item: updatedProject, action: 'edit' })
}

export default NormalizeItemIds