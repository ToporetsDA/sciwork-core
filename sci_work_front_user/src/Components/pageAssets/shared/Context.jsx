import { createContext } from 'react'

export const AppContext = createContext()

export const AppProvider = ({ children, vals }) => {

  return (
    <AppContext.Provider value={{ ...vals }}>
      {children}
    </AppContext.Provider>
  )
}