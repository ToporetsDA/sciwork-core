import React, { Suspense }  from 'react'
import { useNavigate } from "react-router-dom"
import '../../css/pages/Projects.css'
import ControlPanel from './sharedComponents/ControlPanel'

import * as Shared from './sharedComponents'

const Projects = ({ userData, setUserData, state, setState, data, setData, itemsToDisplay, setItemsToDisplay, rights, recentActivities, setRecentActivities }) => {

    const navigate = useNavigate()

    //open project
    const goTo = Shared.GoTo

    const getAccess = (item) => {
        return item.userList.find(item => item.id === userData._id).access
    }

    // Delete item
    const handleDelete = (itemToDelete) => {
        let updatedProject

        data.forEach(project => {
            if (project._id === itemToDelete._id) {

                // Update project
                updatedProject = {
                    ...project,
                    activities: project.activities.map((activity) => {
                        return { ...activity, deleted: true }
                    }),
                    deleted: true
                }
            }
            else if (project._id === state.currentProject?._id) {

                // Update activity
                updatedProject = {
                    ...project,
                    activities: project.activities.map((activity) => {
                        return activity._id === (itemToDelete._id) ? { ...activity, deleted: true } : activity
                    })
                }
                console.log("deleted", project.activities.find((activity) => activity._id === itemToDelete._id))
                navigate(`/Projects/${updatedProject.name}`)
            }
        })

        setData({ action: "edit", item: updatedProject })
    }

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
            <div className='itemList'>
                {(!state.currentProject) ? (
                    <Suspense fallback={<div>Loading projects...</div>}>
                        {itemsToDisplay.projects.map((project, index) => (
                            <div
                                key={index}
                                className={`
                                    card
                                    ${(new Date(project.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
                                    ${(new Date(project.endDate) < new Date()) ? 'expired' : ''}
                                `}
                                onClick={() => {
                                    navigate(goTo(project, data, recentActivities, setRecentActivities))
                                }}
                            >
                                <h3 className='name'>
                                    {project.name}
                                </h3>
                                <p className='timeLimit'>
                                    {project.startDate ? project.startDate : 'N/A'} - {project.endDate}
                                </p>
                                {!project.deleted && rights.edit.includes(getAccess(project)) &&
                                    <div className='actions'>
                                        <button
                                            className='gearButton'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    currentDialog: {
                                                        name: 'AddEditItem',
                                                        params: [project]},
                                                }));
                                            }}
                                        >
                                            ⚙️
                                        </button>
                                        <button
                                            className='deleteButton'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project);
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                }
                            </div>
                        ))}
                    </Suspense>
                ) : (
                    <Suspense fallback={<div>Loading activities...</div>}>
                        {state.currentProject && state.currentProject.activities ? (
                            itemsToDisplay.activities.map((activity, index) => (
                                <div
                                    key={index}
                                    className={`
                                        card
                                        ${(new Date(activity.endDate) - new Date()) / (24 * 60 * 60 * 1000) < 30 ? 'expiring' : ''}
                                        ${(new Date(activity.endDate) < new Date()) ? 'expired' : ''}
                                    `}
                                    onClick={() => {
                                        navigate(goTo(activity, data, recentActivities, setRecentActivities))
                                    }}
                                >
                                    <h3 className='name'>{activity.name}</h3>
                                    <p className='timeLimit'>
                                        {activity.startDate ? activity.startDate : 'N/A'} - {activity.endDate}
                                    </p>
                                    <p className='details'>
                                        {activity.thirdParty ? `Service: ${activity.serviceName}` : 'No third-party service'}
                                    </p>
                                    {!activity.deleted && rights.edit.includes(getAccess(state.currentProject)) &&
                                        <div className='actions'>
                                        <button
                                            className='gearButton'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    currentDialog: {
                                                        name: 'AddEditItem',
                                                        params: [activity]},
                                                }));
                                            }}
                                        >
                                            ⚙️
                                        </button>
                                        <button
                                            className='deleteButton'
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(activity)
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                    }
                                </div>
                            ))
                        ) : (
                            <div>No activities available</div>
                        )}
                    </Suspense>
                )}
            </div>
        </>
    )}

export default Projects
