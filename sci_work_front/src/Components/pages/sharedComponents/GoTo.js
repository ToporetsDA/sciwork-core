//item here is either Activity or Project Object

const GoTo = (destination, data, recentActivities, setRecentActivities) => {
    
    const projectId = (id) => {
        return id.split('.')[0]
    }

    if (destination._id.includes(".")) {
        //update list of recent activities
        const activityExists = recentActivities.some(recent => recent._id === destination._id)
        if (activityExists === false) {
            setRecentActivities((prevActivities) => [
                ...prevActivities,
                destination
            ])
        }
    }

    if (!destination._id.includes(".")) {
        const project = data.find(p => p._id === destination._id)
        return `/Project/${project._id}`
    }
    else if (destination.page === true) {

        const project = data.find(p => p._id === projectId(destination._id))
        const activity = project.activities.find(a => a._id === destination._id)
        return `/Activity/${project._id}/${activity.id}`
    }
    else {
        const project = data.find(p => p._id === projectId(destination._id))
        return `/Project/${project._id}`
    }
}

export default GoTo