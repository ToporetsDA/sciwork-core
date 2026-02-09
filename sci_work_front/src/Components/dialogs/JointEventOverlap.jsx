import { useContext } from 'react'

import '../../Styles/components/dialogs/JointEventOverlap.sass'

import { AppContext, ItemTable } from '../pageAssets/shared'

const JointEventOverlapDialog = () => {

    const { //can not apply url-based itemIds in dialogs
        projects,
        setDialog,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("dialogs")

    // ==================================
    // dialog logic
    // ==================================

    const closeDialog = (e) => {
        if (e.target === e.currentTarget) {
            setDialog({
                name: undefined,
                params: []
            })
        }
    }

    // ==================================

    return (
        <div
            className="dialog-container"
            onClick={closeDialog}
        >
            <div className="dialog-content">
                <ItemTable
                    itemsToDisplay={projects}
                    itemKeys={["name", "startDate", "endDate"]}
                    //itemTypes
                    editable={false}
                    isItem={true}
                    //linkActions
                />
                <button
                    className='button-main'
                    onClick={closeDialog}
                >
                    {t("jointEventOverlap.actions.back")}
                </button>
            </div>
        </div>
    )
}

export default JointEventOverlapDialog