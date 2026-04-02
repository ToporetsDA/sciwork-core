
import { useState, useRef, useContext } from 'react'

import '../../Styles/components/dialogs/LogIn.sass'

import { TYPE_OPTIONS, LOGIN_FORM, REGISTER_FORM } from '../../lib/constants'

import { AppContext, CustomSelect, Form, ToggleButton } from '../pageAssets/shared'

const Enter = ({
    servers,
    handleEnter
}) => {

    const { //can not apply url-based itemIds in dialogs
        setDialog,
        isLoggedIn,
        useLocale
    } = useContext(AppContext)

    const { t } = useLocale("dialogs.enter")

    // ==================================
    // const, helpers and state management
    // ==================================

    const [canReg, setCanReg] = useState(false)

    const [type, setType] = useState({type: "Log in"})
    const isLogIn = (type.type === "Log in")

    const [currentServer, setCurrentServer] = useState("")

    const [formValuesL, setFormValuesL] = useState(() => {
        return {
            login: "",
            password: ""
        }
    })

    const [formValuesR, setFormValuesR] = useState(() => {
        return {
            login: "",
            password: "",
            email: ""
        }
    })

    const saveRef = useRef([])

    // ==================================
    // dialog logic
    // ==================================

    const handleSetServer = (address) => {
        const server = servers.find(s => s.address === address)
        if (!server) {
            return
        }
        setCurrentServer(server)
        setCanReg(server.canReg)
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()
        if (servers.length === 0) {
            alert(`No servers available. Unable to ${type}.`)
            return
        }

        const save = saveRef.current
        save()
    }

    const save = (data) => {
        handleEnter(
            type.type,
            currentServer,
            data
        )
    }

    const closeDialog = (e) => {
        if (e.target === e.currentTarget) {
            setDialog((prevState) => {
                this.name = undefined
                this.params = []
            })
        }
    }

    // ==================================

    return (
        <>
            {!isLoggedIn &&
            <div className="auth-dialog dialog-container">
                <div className="dialog-content">
                    {/* Server Selection */}
                    <label htmlFor="server">
                        {t("fields.server.label")}
                    </label>
                    <CustomSelect
                        id={"server"}
                        name={"server"}
                        value={currentServer?.name || ""}
                        handler={handleSetServer}
                        options={servers}
                        optionSelectField={"id"}
                        optionContentField={"name"}
                        placeholder={"Select server"}
                        emptyPlaceholder={t("fields.server.placeholder")}
                        disabled={false}
                    />
                    {canReg
                        ? (
                            <ToggleButton
                                data={type}
                                setter={setType}
                                field={"type"}
                                displayOptions={TYPE_OPTIONS}
                                showDisplayOptions={TYPE_OPTIONS.map(o => t(`options.${o}`))}
                            />
                        )
                        : (
                            <h3>{t("label")}</h3>
                        )
                    }
                    <Form
                        dataFormat={isLogIn ? LOGIN_FORM : REGISTER_FORM}
                        dataToEdit={isLogIn ? formValuesL : formValuesR}
                        handleSpecial={() => {}}
                        save={save}
                        callSave={saveRef}
                        tmpData={isLogIn ? formValuesL : formValuesR}
                        setTempData={isLogIn ? setFormValuesL : setFormValuesR}
                        editMode={true}
                        alwaysEdit={true}
                    />

                    <div>
                        <button
                            type="submit"
                            className="button-main"
                            onClick={handleSubmit}
                        >
                            {isLogIn ? t("actions.logIn") : t("actions.register")}
                        </button>
                        <button
                            className='button-main'
                            onClick={closeDialog}
                        >
                            {t("actions.back")}
                        </button>
                    </div>
                </div>
            </div>
            }
        </>
    )
}

export default Enter