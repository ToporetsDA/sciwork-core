import { useEffect } from 'react'
import { useTranslation } from "react-i18next"

type TimerProps = {
  event: (now: Date, period: number, delay: number) => void
  period: number // у хвилинах
  delay: number // у мілісекундах
  isLoggedIn: boolean
}

export const useTimer = ({event, period, delay, isLoggedIn}: TimerProps) => {
  useEffect(() => {
    if (!isLoggedIn || typeof event !== "function") {
        return
    }

    const runEvent = () => {
      const now = new Date()
      event(now, period, delay)
    }

    const now = new Date()
    const msToNextMark =
      period * 60 * 1000 -
      ((now.getMinutes() % period) * 60 * 1000 +
       now.getSeconds() * 1000 +
       now.getMilliseconds())

    let intervalId: ReturnType<typeof setInterval> | undefined

    const timeoutId = setTimeout(() => {
      runEvent()
      intervalId = setInterval(runEvent, period * 60 * 1000)
    }, msToNextMark + delay)

    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [event, period, delay, isLoggedIn])
}

export const useDeepTranslation = (path: string) => {
  const parts = path.split('.')
  const namespace = parts[0]
  const basePath = parts.slice(1).join('.')
  const { t } = useTranslation(namespace)
  const translate = (key: string, options?: any) =>
    t(basePath ? `${basePath}.${key}` : key, options)
  return { t: translate }
}