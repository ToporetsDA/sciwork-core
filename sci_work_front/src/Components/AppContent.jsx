import { lazy, Suspense, useContext } from 'react'
import { Routes, Route } from "react-router-dom"

import '../Styles/components/AppContent.sass'

import { AppContext } from './pageAssets/shared'

import { HomePage, Notifications, Profile, Settings } from './pages'
import * as Dialogs from './dialogs'

const AppContent = () => {

    const {
        state
    } = useContext(AppContext)

    const loadDialogComponent = (dialogName) => {
        return Dialogs[dialogName.replace(/\s+/g, '')]
    }

    const DialogComponent =
        (state.currentDialog.name && state.currentDialog.name !== "LogIn")
            ? loadDialogComponent(state.currentDialog.name)
            : null
    
    //heavy pages
    const Projects = lazy(() => import("./pages/Projects"))
    const Schedule = lazy(() => import("./pages/Schedule"))

  return (
    <main className="content">
        {DialogComponent && <DialogComponent />}

        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/HomePage" element={<HomePage />} />
                <Route path="/Notifications" element={<Notifications />} />
                <Route path="/Profile" element={<Profile />} />
                <Route path="/Schedule" element={<Schedule />} />
                <Route path="/Settings" element={<Settings />} />

                <Route path="/Projects" element={<Projects />}>
                    <Route path=":projectId" element={<Projects />} >
                        <Route path=":activityId" element={<Projects />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    </main>
  )
}

export default AppContent