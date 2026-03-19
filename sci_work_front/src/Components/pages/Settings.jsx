import { useContext } from 'react'

import '../../Styles/components/pages/Settings.sass'

import { formatFrorValuesmForSave } from '../../lib/helpers'

import { AppContext, FormExtended } from '../pageAssets/shared'

const Settings = () => {

    const {
        setData,
        userData,
        displaySettings,
        formatOfDisplaySettings,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("pages.settings")

    // ==================================
    // const, helpers and state management
    // ==================================

    // ==================================
    // userData update
    // ==================================

    const handleSubmit = (changedData) => {

        const formatedChangedData = formatFrorValuesmForSave(changedData)
        
        setData({
            domain: "displaySettings",
            id: userData._id,
            recipe: (draft) => {
                Object.assign(draft, formatedChangedData)
            }
        })
    }

    // cuurently not used
    const handleSpecial = (field, value, formVals, setFormVals) => {

        switch(field) {
            case"": {
                
                return
            }
            default: {
                console.warn(`No handler case for field ${field}`)
                return ''
            }
        }
    }

    // ==================================

    return (
        <div className="settings-page .page-wrapper-no-cp">
            <h2>{t("label")}</h2>
            <FormExtended
                label = {""}
                dataFormat = {formatOfDisplaySettings}
                dataToEdit = {displaySettings}
                handleSpecial = {handleSpecial}
                save = {handleSubmit}
                alwaysEdit = {false}
                immediateApply = {true}
            />
        </div>
    )
}

export default Settings