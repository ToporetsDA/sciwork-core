import { useState, useRef, useEffect, useMemo, useContext } from 'react'

import '../../Styles/components/_base/AppHeader.sass'
import { PAGES, MORE_PAGES, HEADER_LANGUAGES } from '../../lib/constants'

import { AppContext, CustomSelect, LanguageSelect } from '../pageAssets/shared'

import logo from '../logo.svg'

const AppHeader = () => {

    const {
        navigate,
        currentPage,
        setDialog,
        userData,
        isLoggedIn, setLoggedIn,
        notifications, setNotifications,
        organisationType,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("base.header")

    const format = (str) => {
        return str.replace(/\s+/g, '')
    }

    const [isMoreOpen, setIsMoreOpen] = useState(false)
    const dropdownRef = useRef(null)
    
    const pages = [...PAGES]
    if (organisationType) {
        pages[2] = 'Projects'
    }
    else {
        pages[2] = 'Subjects'
    }
    
    const morePages = [...MORE_PAGES]
    if (userData.genStatus === 0) {
        morePages.push('User List')
    }

    const notificationsMark = useMemo(() => {
        if (isLoggedIn === true) {
            return notifications.filter(notification => notification.state === "unseen").length
        }
        return -1
    }, [notifications, isLoggedIn])

    const setAllSeen = () => {
        setNotifications(notifications.map(n => {
            if (n.state === "unseen") {
                const copy = new Notification(
                    n._id,
                    "seen",
                    n.page,
                    n.content,
                    new Date(`${n.generationDate}T${n.generationTime}:00`))
                return copy
            }
            else {
                return n
            }
        }))
    }

    //go to page
    const handleClick = (page) => {

        const uniPage = (page === "Subjects") ? "Projects" : page

        navigate(`/${uniPage}`)
        setIsMoreOpen(false)

        if (page === "Notifications") {
            setAllSeen()
        }
    }

    const handleDialog = (dialog, params) => {
        setDialog((prevState) => ({
            name: dialog,
            params: params
        }))
    }

    //log out
    const handleLogOut = () => {
        handleClick(format("Home Page"))
        handleDialog()
        setLoggedIn(false)
    }

    // (V) close dropdown menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsMoreOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownRef])

    const getLi = (page, toDisplay) => {

        return (
            <li
                key={format(page)}
                onClick={() => handleClick(format(page))}
                className={currentPage === format(page) ? 'active' : ''}
                style={{
                fontWeight: currentPage === format(page) ? 'bold' : 'normal',
                pointerEvents: currentPage === format(page) ? 'none' : 'auto',
                opacity: currentPage === format(page) ? 0.5 : 1,
                }}
            >
                <p>{toDisplay}</p>
                {format(page) === 'Notifications' && notificationsMark > 0 && (
                    <span className="notification-circle">{(notificationsMark > 99) ? "99+" : notificationsMark}</span>
                )}
            </li>
        )
    }

    const LangSelect = LanguageSelect(CustomSelect)
    
    return (
        <header>
            <img className="logo" src={logo} alt="SciWork" />
            <ul className="menu">
            {(isLoggedIn === true) ? (
                <>
                    {pages.map((page, index) => (
                        getLi(page, t(`pages.${page}`))
                    ))}
                    <li
                        onClick={setIsMoreOpen(!isMoreOpen)}
                        ref={dropdownRef}
                    >
                        <p
                            onClick={setIsMoreOpen(!isMoreOpen)}
                            style={{
                                fontWeight: isMoreOpen ? 'bold' : 'normal',
                                pointerEvents: 'auto',
                                opacity: isMoreOpen ? 0.5 : 1,
                            }}
                        >
                            {t("more.name")}
                        </p>
                        {!isMoreOpen && notificationsMark > 0 && (
                                <span className="notification-circle">{(notificationsMark > 99) ? "99+" : notificationsMark}</span>
                        )}
                        {isMoreOpen && (
                            <ul className="more">
                                {morePages.map((page, index) => (
                                    getLi(page, t(`more.${page}`))
                                ))}
                                <li onClick={handleLogOut}>
                                    <p>
                                        {t("auth.out")}
                                    </p>
                                </li>
                            </ul>
                        )}
                    </li>
                </>
            ) : (
                <li
                    key={"LogIn/Register"}
                    onClick={() => handleDialog("Enter")}
                >
                    <p>{t("auth.in")}</p>
                </li>
            )}
            </ul>
            <LangSelect
                id="headerLanguageSelect"
                name="Locale"
                options={HEADER_LANGUAGES}
                optionSelectField="code"
                optionContentField="img"
                placeholder="ERROR: Should be EN"
                emptyPlaceholder="FATAL ERROR: languages not found"
            />
        </header>
    )
}

export default AppHeader