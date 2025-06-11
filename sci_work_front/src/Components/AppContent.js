import { useState, Suspense } from 'react'
import '../css/components/AppContent.css'
import * as Pages from './pages'
import * as Dialogs from './dialogs'

import * as Shared from '../Components/pages/sharedComponents'

const AppContent = ({
    userData, setUserData,
    profileData,
    state, setState,
    projects,
    activities,
    setData,
    rights,
    users, setUsers,
    itemStructure,
    defaultStructure,
    isCompany,
    notifications, setNotifications,
    recentActivities, setRecentActivities
}) => {

    // dialogs

    const loadDialogComponent = (dialogName) => {
        return Dialogs[dialogName.replace(/\s+/g, '')]
    }

    const DialogComponent = (state.currentDialog.name !== undefined && state.currentDialog.name !== "LogIn") ? loadDialogComponent(state.currentDialog.name) : undefined

    // pages
    
    const loadPageComponent = (pageName) => {
        let formattedPageName
        switch(pageName) {
            case"Subjects":
            case"Project": {
                formattedPageName = "Projects"
                break
            }
            default: {formattedPageName = pageName}
        }
        return Pages[formattedPageName.replace(/\s+/g, '')]
    }

    const PageComponent = state.currentPage ? loadPageComponent(state.currentPage) : undefined

    // more for pages

    const project = Shared.GetItemById(projects, state.currentProject)

    const [itemsToDisplay, setItemsToDisplay] = useState({
        projects: projects || [],
        activities: project?.activities ? project.activities : []
    }, [state.currentProject, projects])

    return (
        <main className="content">
            {DialogComponent &&
                <DialogComponent
                    userData={userData}
                    setUserData={setUserData}
                    projects={projects}
                    activities={activities}
                    setData={setData}
                    state={state}
                    setState={setState}
                    rights={rights}
                    users={users}
                    itemStructure={itemStructure}
                    defaultStructure={defaultStructure}
                    isCompany={isCompany}
                />
            }
            {PageComponent ? (
                <Suspense fallback={<div>Loading...</div>}>
                    <PageComponent
                        userData={userData}
                        setUserData={setUserData}
                        profileData={profileData}
                        state={state}
                        setState={setState}
                        projects={projects}
                        activities={activities}
                        setData={setData}
                        itemsToDisplay={itemsToDisplay}
                        setItemsToDisplay={setItemsToDisplay}
                        rights={rights}
                        users={users}
                        setUsers={setUsers}
                        notifications={notifications}
                        setNotifications={setNotifications}
                        recentActivities={recentActivities}
                        setRecentActivities={setRecentActivities}
                    />
                </Suspense>
            ) : (
                <div>No page to display</div>
            )}
        </main>
    )
}

export default AppContent