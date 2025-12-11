import { useState, useEffect, Suspense, useContext } from 'react'
import '../css/components/AppContent.css'
import * as Pages from './pages'
import * as Dialogs from './dialogs'

import * as Shared from './pages/shared'

const AppContent = () => {

    const {
        state,
        projects
    } = useContext(Shared.AppContext)

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

    const project = Shared.getItemById(projects, state.currentProject)

    const [itemsToDisplay, setItemsToDisplay] = useState({
        projects: projects || [],
        activities: project?.activities || []
    })

    useEffect(() => {
        setItemsToDisplay({
            projects: projects || [],
            activities: project?.activities || []
        })
    }, [projects, project?.activities])

    return (
        <main className="content">
            {DialogComponent &&
                <DialogComponent
                    itemsToDisplay={itemsToDisplay}
                    setItemsToDisplay={setItemsToDisplay}
                />
            }
            {PageComponent ? (
                <Suspense fallback={<div>Loading...</div>}>
                    <PageComponent
                        itemsToDisplay={itemsToDisplay}
                        setItemsToDisplay={setItemsToDisplay}
                    />
                </Suspense>
            ) : (
                <div>No page to display</div>
            )}
        </main>
    )
}

export default AppContent