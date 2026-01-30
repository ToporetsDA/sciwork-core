// Libraries
import { useState, useEffect, Suspense, useContext } from 'react'
// Styles, Classes, Constants
import '../css/components/AppContent.css'
import { createItemsToDisplay } from '../Basics/classes'
// Methods, Components
import * as Shared from './pages/shared'
import * as Pages from './pages'
import * as Dialogs from './dialogs'

const AppContent = () => {

    const {
        state,
        projects
    } = useContext(Shared.AppContext)

    // dialogs

    const loadDialogComponent = (dialogName) => {
        return Dialogs[dialogName.replace(/\s+/g, '')]
    }

    const DialogComponent = (state.currentDialog.name !== undefined && state.currentDialog.name !== "LogIn")
        ? loadDialogComponent(state.currentDialog.name)
        : undefined

    // pages
    
    const loadPageComponent = (pageName) => {
        switch(pageName) {
            case"Subjects":
            case"Project": {
                return Pages["Projects".replace(/\s+/g, '')]
            }
            default: {
                return Pages[pageName.replace(/\s+/g, '')]
            }
        }
    }

    const PageComponent = state.currentPage ? loadPageComponent(state.currentPage) : undefined

    // more for pages

    const project = Shared.getItemById(projects, state.currentProject)

    const [itemsToDisplay, setItemsToDisplay] = useState(createItemsToDisplay(projects, project))

    useEffect(() => {
        setItemsToDisplay(createItemsToDisplay(projects, project))
    }, [projects, project])

    return (
        <main className="content">
            {DialogComponent &&
                <DialogComponent/>
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