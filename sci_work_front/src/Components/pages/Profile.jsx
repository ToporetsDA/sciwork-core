
import { useContext } from 'react'

import '../../Styles/components/pages/Profile.sass'

import { formatFormValues } from '../../lib/helpers'

import { AppContext, Form } from '../pageAssets/shared'

const Profile = () => {

    const {
        setData,
        userData,
        formatOfProfileData,
        displaySettings,
        rights,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("pages.profile")

    // ==================================
    // const, helpers and state management
    // ==================================

    // ==================================
    // userData update
    // ==================================

    const handleSubmit = (changedData) => {

        const formatedChangedData = formatFormValues(changedData, displaySettings, "toDomain")
        
        setData({
            domain: "user",
            id: userData._id,
            recipe: (draft) => {
                Object.assign(draft, formatedChangedData)
            }
        })
    }

    const handleSpecialDisplay = (field) => {
        switch(field) {
            case"statusName": {
                return rights.names[userData.genStatus]
            }
            default: {
                return ''
            }
        }
    }

    // ==================================
    
    return (
        <div className="account-page .page-wrapper-no-cp">
            <h2>{t("label")}</h2>
            {/* <div className='accountImage'>
                {userData.photo !== undefined &&
                    <></>
                }
            </div> */}
            <Form
                label = {t("shortLabel")}
                dataFormat = {formatOfProfileData}
                dataToEdit = {userData}
                handleSpecialDisplay = {handleSpecialDisplay}
                save = {handleSubmit}
                alwaysEdit = {false}
            />
            <div className="account-actions">
                {
                    //later add critical options like deactivate/delete account
                }
            </div>
        </div>
    )
}

export default Profile