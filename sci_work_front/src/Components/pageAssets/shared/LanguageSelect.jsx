import { useContext } from 'react'


import { LANGUAGES, LANGUAGES_FULL } from '../../../lib/constants'
import { getSelect } from '../../../lib/helpers'

import { AppContext } from './'

const LanguageSelect = () => {
    
    const { useLocale } = useContext(AppContext)
    const { i18n } = useLocale()

    const changeLang = (e) => {
        const lng = e.target.value
        i18n.changeLanguage(lng)
        localStorage.setItem("lang", lng)
    }

    return getSelect(
        i18n.language,
        changeLang,
        LANGUAGES,
        LANGUAGES_FULL
    )
}

export default LanguageSelect