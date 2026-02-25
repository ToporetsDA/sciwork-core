import { useState, useRef } from "react"

import "../../../Styles/lib/select.sass"

/* from
LogIn
ControlPanel
AddEditUserList
AddEditContent
*/

const CustomSelect = ({
    id,
    name,
    value,
    handler,
    options = [],
    optionSelectField,
    optionContentField,
    placeholder = "Select an option",
    emptyPlaceholder = "No options available",
    disabled = false
}) => {
    
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef(null)

    const handleOptionClick = (val) => {
        handler(val)
        setIsOpen(false)
    }

    const selectedOption = options.find((o) => o[optionSelectField] === value)

    const getValueToDisplay = (option) => {

        switch(optionContentField) {
            case"img": {
                return (
                    <>
                        <img src={option[optionContentField]} alt="No flag"/>
                        {option[optionSelectField]}
                    </>
                )
            }
            default: {
                return option[optionContentField]
            }
        }
    }

    return (
        <div className="custom-select-wrapper">
            {/* Native select for accessibility + form support */}
            <select
                id={id}
                name={name}
                value={value}
                onChange={handler}
                ref={selectRef}
                disabled={disabled}
                className="native-select"
            >
                <option value="" disabled>
                    {(options.length === 0) ? emptyPlaceholder : placeholder}
                </option>
                    {options.map((o) => (
                <option key={o[optionSelectField]} value={o[optionSelectField]}>
                    {o[optionContentField]}
                </option>
                ))}
            </select>

            {/* Custom styled dropdown */}
            <div
                className={`custom-select ${isOpen ? "opened" : ""} ${disabled ? "disabled" : ""}`}
                tabIndex={0}
                onBlur={() => setIsOpen(false)}
            >
                <span
                    className="custom-select-trigger"
                    onClick={(e) => {
                        if (!disabled) {
                        e.stopPropagation()
                        setIsOpen((prev) => !prev)
                        }
                    }}
                >
                    {getValueToDisplay(selectedOption)}
                </span>
                {isOpen && (
                    <div className="custom-options">
                        {options.map((option) => (
                        <span
                            key={option[optionSelectField]}
                            className={`custom-option ${value === option[optionSelectField] ? "selection" : ""}`}
                            onClick={() => handleOptionClick(option[optionSelectField])}
                        >
                            {getValueToDisplay(option)}
                        </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CustomSelect
