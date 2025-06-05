const GetDialogButton  = (setState, buttonClass, dialog, params, text) => {
    return (
        <button className={`${buttonClass}`} onClick={() => {
            setState((prevState) => ({
                ...prevState,
                currentDialog: {
                    name: dialog,
                    params
                }
            }))
        }}>
            {text}
        </button>
    )
}

export default GetDialogButton