
import { useState, useRef, useContext } from 'react'

import '../../../Styles/components/pageAssets/shared/Form.sass'

import { AppContext, Form } from './'

/* from:
pages/Settings.js
pages/Profile.js
*/

const FormExtended = (
    label,
    dataFormat,
    dataToEdit,
    handleSpecial,
    save,
    immediateApply = false,
    alwaysEdit = false
) => {

    const {
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("pageAssets.shared.formExtended")

    // ==================================
    // const, helpers and state management
    // ==================================

    const [editMode, setEditMode] = useState(false)
    const [tmpData, setTempData] = useState({ ...dataToEdit })

    // ==================================
    // userData update management
    // ==================================

    const saveRef = useRef([])

    const handleSubmit = () => {
        const save = saveRef.current
        save()
    }

    // ==================================
    
    return (
        <div className="form-page .page-wrapper-no-cp">
            <h2>{label}</h2>
            <Form
                dataFormat = {dataFormat}
                dataToEdit = {dataToEdit}
                handleSpecial = {handleSpecial}
                save = {save}
                callSave = {saveRef}
                tmpData = {tmpData}
                setTempData = {setTempData}
                editMode = {editMode}
                alwaysEdit = {alwaysEdit}
            />
            {!immediateApply && (
                <div className="form-actions">
                    {(editMode || alwaysEdit) ? (
                        <>
                            <button
                                className='button-main'
                                onClick={handleSubmit}
                                disabled={alwaysEdit && (dataToEdit === tmpData)}
                            >
                                {t("save")}
                            </button>
                            {!alwaysEdit &&
                            <button
                                className='button-main'
                                onClick={() => {
                                    setTempData({ ...dataToEdit })
                                    setEditMode(false)
                                }}
                            >
                                {t("cancel")}
                            </button>
                            }
                        </>
                    ) : (
                        <button
                            className='button-main'
                            onClick={() => setEditMode(true)}
                        >
                            {t("edit")}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

export default FormExtended