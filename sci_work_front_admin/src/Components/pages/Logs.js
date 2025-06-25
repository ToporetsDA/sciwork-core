import { Suspense, useState, useEffect }  from 'react'
import '../../css/components/pages/Projects.css'

import * as Shared from './shared'

const Projects = ({
    userData, setUserData,
    state, setState,
    projects, 
    activities,
    setData,
    itemsToDisplay, setItemsToDisplay,
    rights,
    users, setUsers,
    recentActivities, setRecentActivities
}) => {

    const displayOptions = new Map([
        ['tiles', 'grid'],
        ['list', 'flex'],
        ['table', 'table']
    ])

    const [containers, setContainers] = useState([])
    useEffect(() => {
        if (state.currentProject) {
            const project = Shared.getItemById(projects, state.currentProject)
            if (activities.length === project.dndCount) {
                setContainers([...project.activities])
            }
        }
    }, [projects, activities, state.currentProject])

    if (state.currentProject && containers.length !== Shared.getItemById(projects, state.currentProject).activities.length) {
        return (
            <>Loading Activities</>
        )
    }

    return (
        <>
            <Shared.ControlPanel
                userData={userData}
                setUserData={setUserData}
                state={state}
                setState={setState}
                rights={rights}
                setItemsToDisplay={setItemsToDisplay}
            />
            <div className={`page-wrapper ${displayOptions.get(userData.currentSettings?.displayLogs || 'tiles')}`}>
                <Suspense fallback={<div>Loading projects...</div>}>
                    {displayOptions.get(userData.currentSettings.displayProjects) !== 'table' ?
                    (
                        <Shared.ItemTiles
                            userData={userData}
                            projects={projects}
                            activities={activities}
                            setData={setData}
                            state={state}
                            setState={setState}
                            itemsToDisplay={itemsToDisplay}
                            containerId={state.currentProject}
                            // containerType={}
                            rights={rights}
                            users={users}
                            setUsers={setUsers}
                            recentActivities={recentActivities}
                            setRecentActivities={setRecentActivities}
                        />
                    ) : (
                        <Shared.ItemTable
                            userData={userData}
                            projects={projects}
                            activities={activities}
                            setData={setData}
                            state={state}
                            setState={setState}
                            itemsToDisplay={projects}
                            itemKeys={["name", "dndCount", "startDate", "endDate"]}
                            //itemTypes
                            editable={false}
                            isItem={true}
                            //linkActions
                            rights={rights}
                            recentActivities={recentActivities}
                            setRecentActivities={setRecentActivities}
                        />
                    )}
                </Suspense>
            </div>
        </>
    )}

export default Projects
