import '../../../css/base/select.css'

/* from
AddEditUserList
AddEditContent
*/

const getSelect = (value, handler, options, keyField, valueField, contentField) => {

    return (
        <>
        <select
            className={`select-mini`}
            value={value}
            onChange={handler}
        >
            {options.map((option) => {
                return (
                    <option key={option[keyField]} value={option[valueField]}>
                        {option[contentField]}
                    </option>
                )
            })}
        </select>
        
        </>
    )
}

export default getSelect