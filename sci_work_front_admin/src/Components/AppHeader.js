import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from "react-router-dom"
import '../css/components/AppHeader.css'
import logo from "../logo.svg"

const AppHeader = ({
    state, setState,
    userData, setUserData,
    isLoggedIn, setLoggedIn,
    organisationType
}) => {

    const navigate = useNavigate()

    const format = (str) => {
        return str.replace(/\s+/g, '')
    }

    const [isDropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)
    
    const pages = ['Home Page', 'Logs', 'Users']
    const morePages = ['Profile', 'Settings']

    //go to page
    const handleClick = (page) => {
        navigate(`/${page}`)
        setDropdownOpen(false)
    }

    const handleDialog = (dialog, params) => {
        setState((prevState) => ({
            ...prevState,
            currentDialog: {
                name: dialog,
                params: params
            }
        }))
    }

    //open dropdown menu with more pages
    const handleMore = () => {
        setDropdownOpen(!isDropdownOpen)
    }

    //log out
    const handleLogOut = () => {
        handleClick(format("Home Page"))
        handleDialog()
        setLoggedIn(false)
    }

    //close dropdown menu if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false)
            }
        };

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [dropdownRef])

    const getLi = (page) => {
        return (
            <li
                key={format(page)}
                onClick={() => handleClick(format(page))}
                className={state.currentPage === format(page) ? 'active' : ''}
                style={{
                fontWeight: state.currentPage === format(page) ? 'bold' : 'normal',
                pointerEvents: state.currentPage === format(page) ? 'none' : 'auto',
                opacity: state.currentPage === format(page) ? 0.5 : 1,
                }}
            >
                <p>{page}</p>
            </li>
        )
    }
    
    return (
        <header>
            <img className="logo" src={logo} alt="SciWork" />
                <ul className="menu">
                {(isLoggedIn === true) ? (
                    <>
                        {pages.map((page) => (
                            getLi(page)
                        ))}
                        <li
                            onClick={handleMore}
                            ref={dropdownRef}
                        >
                            <p
                                onClick={handleMore}
                                style={{
                                    fontWeight: isDropdownOpen ? 'bold' : 'normal',
                                    pointerEvents: 'auto',
                                    opacity: isDropdownOpen ? 0.5 : 1,
                                }}
                            >
                                More
                            </p>
                            {isDropdownOpen && (
                                <ul className="more">
                                    {morePages.map((page) => (
                                        getLi(page)
                                    ))}
                                    <li onClick={handleLogOut}><p>Log Out</p></li>
                                </ul>
                            )}
                        </li>
                    </>
                ) : (
                    <li
                        key={"LogIn"}
                        onClick={() => handleDialog("LogIn")}
                    >
                        <p>Log In</p>
                    </li>
                )}
            </ul>
        </header>
    )}

export default AppHeader