import { Suspense } from 'react'
import '../css/components/AppContent.css'
import * as Pages from './pages'
import * as Dialogs from './dialogs'

// import * as Shared from './pages/shared'

const AppContent = ({
    userData, setUserData,
    profileData,
    state, setState,
    rights,
    users, setUsers,
    isCompany
}) => {

    // dialogs

    const loadDialogComponent = (dialogName) => {
        return Dialogs[dialogName.replace(/\s+/g, '')]
    }

    const DialogComponent = (state.currentDialog.name !== undefined && state.currentDialog.name !== "LogIn") ? loadDialogComponent(state.currentDialog.name) : undefined

    // pages
    
    const loadPageComponent = (pageName) => {
        return Pages[pageName.replace(/\s+/g, '')]
    }

    const PageComponent = state.currentPage ? loadPageComponent(state.currentPage) : undefined

    return (
        <main className="content">
            {DialogComponent &&
                <DialogComponent
                    userData={userData}
                    setUserData={setUserData}
                    profileData={profileData}
                    state={state}
                    setState={setState}
                    rights={rights}
                    users={users}
                    setUsers={setUsers}
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
                        rights={rights}
                        users={users}
                        setUsers={setUsers}
                    />
                </Suspense>
            ) : (
                <div>No page to display</div>
            )}
        </main>
    )
}

export default AppContent