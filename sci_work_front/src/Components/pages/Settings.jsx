import { useContext } from 'react'

import '../../Styles/components/pages/Settings.sass'

import { AppContext, Form } from '../pageAssets/shared'

const Settings = () => {

    const {
        setData,
        userData,
        displaySettings,
        profileData,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("pages.settings")

    // ==================================
    // const, helpers and state management
    // ==================================

    // ==================================
    // userData update
    // ==================================

    const saveChanges = (changedData) => {
        
        setData({
            domain: "displaySettings",
            id: userData._id,
            recipe: (draft) => {
                Object.assign(draft, changedData)
            }
        })
    }

    // cuurently not used
    const handleSpecialDisplay = (field) => {
        switch(field) {
            case"": {
                return ''
            }
            default: {
                return ''
            }
        }
    }

    // ==================================

    return (
        <div className="settings-page .page-wrapper-no-cp">
            <h2>{t("label")}</h2>
            <Form
                label = {""}
                defaultData = {profileData}
                dataToEdit = {displaySettings}
                handleSpecialDisplay = {handleSpecialDisplay}
                save = {saveChanges}
                alwaysEdit = {false}
            />
        </div>
    )
}

export default Settings