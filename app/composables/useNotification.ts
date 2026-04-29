/*
  Système de notification toast pour les retours utilisateur.
*/
export interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'loading'
  message: string
  duration?: number
}

export const useNotification = () => {
  const notifications = useState<Notification[]>('notifications', () => [])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()
    const newNotification = { ...notification, id, duration: notification.duration || 4000 }
    notifications.value.push(newNotification)

    if (newNotification.type !== 'loading') {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
  }

  const removeNotification = (id: string) => {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  return {
    notifications,
    addNotification,
    removeNotification
  }
}
