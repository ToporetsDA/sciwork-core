import { Suspense }  from 'react'
import '../../css/pages/Projects.css'
import ControlPanel from './sharedComponents/ControlPanel'

import * as Shared from './sharedComponents'

const Projects = ({ userData, setUserData, state, setState, data, setData, itemsToDisplay, setItemsToDisplay, rights, recentActivities, setRecentActivities }) => {

    const displayOptions = new Map([
        ['tiles', 'grid'],
        ['list', 'flex'],
        ['table', 'table']
    ])

    return (
        <>
            <ControlPanel
                userData={userData}
                setUserData={setUserData}
                state={state}
                setState={setState}
                data={data}
                rights={rights}
                setItemsToDisplay={setItemsToDisplay}
            />
            <div className={`itemList ${displayOptions.get(userData.currentSettings.displayProjects)}`}>
                {(state.currentPage === "Projects") ? (
                    <Suspense fallback={<div>Loading projects...</div>}>
                        {displayOptions.get(userData.currentSettings.displayProjects) !== 'table' ? (
                            <Shared.ItemTiles
                                userData={userData}
                                data={data}
                                setData={setData}
                                state={state}
                                setState={setState}
                                itemsToDisplay={itemsToDisplay.projects}
                                rights={rights}
                                recentActivities={recentActivities}
                                setRecentActivities={setRecentActivities}
                            />
                        ) : (
                            <Shared.ItemTable
                                userData={userData}
                                data={data}
                                setData={setData}
                                state={state}
                                setState={setState}
                                itemsToDisplay={itemsToDisplay.projects}
                                rights={rights}
                                recentActivities={recentActivities}
                                setRecentActivities={setRecentActivities}
                            />
                        )}
                    </Suspense>
                ) : (
                    <Suspense fallback={<div>Loading activities...</div>}>
                        <Shared.ItemTiles
                            userData={userData}
                            data={data}
                            setData={setData}
                            state={state}
                            setState={setState}
                            itemsToDisplay={itemsToDisplay.activities}
                            rights={rights}
                            recentActivities={recentActivities}
                            setRecentActivities={setRecentActivities}
                        />
                    </Suspense>
                )}
            </div>
        </>
    )}

export default Projects
