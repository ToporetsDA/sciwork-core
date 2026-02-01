import { Suspense, useContext } from 'react'
import { Routes, Route } from "react-router-dom"

import '../Styles/components/AppContent.sass'

import { AppContext } from './pageAssets/shared'

import * as Pages from './pages'
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

  return (
    <main className="content">
        {DialogComponent && <DialogComponent />}

        <Suspense fallback={<div>Loading...</div>}>
            <Routes>
                <Route path="/HomePage" element={<Pages.HomePage />} />
                <Route path="/Notifications" element={<Pages.Notifications />} />
                <Route path="/Profile" element={<Pages.Profile />} />
                <Route path="/Schedule" element={<Pages.Schedule />} />
                <Route path="/Settings" element={<Pages.Settings />} />

                <Route path="/Projects" element={<Pages.Projects />}>
                    <Route path=":projectId" element={<Pages.Projects />} >
                        <Route path=":activityId" element={<Pages.Projects />} />
                    </Route>
                </Route>
            </Routes>
        </Suspense>
    </main>
  )
}

export default AppContent