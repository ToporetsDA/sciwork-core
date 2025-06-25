const deleteItem = (data, setData, _id, deleted) => {

    const projectId = _id.split('.')[0]
    
    const project = data.find(p => p._id === projectId)
    let activities

    if (_id.includes(".")) {
        //delete activity
        activities = project.activities.map((activity) => {
            return activity._id === (_id) ? { ...activity, deleted } : activity
        })
    }
    else {
        //delete project
        activities = project.activities.map((activity) => {
            return { ...activity,  }
        })
    }

    const updatedProject = {
        ...project,
        activities,
        ...(!_id.includes(".") && {deleted})
    }

    console.log("deleted:", _id)

    setData({ action: "edit", item: updatedProject })
}

export default deleteItem