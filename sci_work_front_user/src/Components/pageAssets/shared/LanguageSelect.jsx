import { useContext } from "react"

import { AppContext } from '.'

const LanguageSelect = (Component) => {

    const {
        displaySettings,
        updateData
        
    } = useContext(AppContext)

    const LanguageEnhanced = (props) => {

        const changeLanguage = (lng) => {

            updateData({
                domain: "displaySettings",
                id: displaySettings._id,
                recipe: draft => {
                    draft.language = lng
                }
            })

        }

        return (
            <Component
                {...props}
                value={displaySettings.language}
                handler={changeLanguage}
            />
        )
    }

    return LanguageEnhanced
}

export default LanguageSelect