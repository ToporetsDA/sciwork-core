import { useContext } from 'react'

import '../../Styles/components/dialogs/JointEventOverlap.sass'

import { AppContext, ItemTable } from '../pageAssets/shared'

const JointEventOverlapDialog = () => {

    const { //can not apply url-based itemIds in dialogs
        dialog,
        setDialog,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("dialogs.jointEventOverlap")

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
            <h2>{t("name")}</h2>
            <div className="dialog-content">
                <ItemTable
                    itemsToDisplay={dialog.params[0]}
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
                    {t("actions.back")}
                </button>
            </div>
        </div>
    )
}

export default JointEventOverlapDialog