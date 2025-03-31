import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  closeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  showNotification: () => {},
  closeNotification: () => {},
});

export const useNotification = () => useContext(NotificationContext);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification = {
      ...notification,
      id,
      autoClose: notification.autoClose !== false,
      duration: notification.duration || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    if (newNotification.autoClose) {
      setTimeout(() => {
        closeNotification(id);
      }, newNotification.duration);
    }
  };

  const closeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        showNotification, 
        closeNotification 
      }}
    >
      {children}
      
      <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2">
        {notifications.map((notification) => (
          <div 
            key={notification.id}
            className={`
              bg-${notification.type === 'success' ? 'green-500' : 
                     notification.type === 'error' ? 'red-500' : 
                     notification.type === 'warning' ? 'yellow-500' : 'blue-500'} 
              text-white px-4 py-3 rounded-lg shadow-lg flex items-start max-w-sm transform transition-all duration-300
            `}
          >
            <span className="material-icons mr-2 mt-0.5">
              {notification.type === 'success' ? 'check_circle' : 
               notification.type === 'error' ? 'error' : 
               notification.type === 'warning' ? 'warning' : 'info'}
            </span>
            <div>
              <h4 className="font-medium">{notification.title}</h4>
              <p className="text-sm opacity-90">{notification.message}</p>
            </div>
            <button 
              className="ml-2 text-white p-1"
              onClick={() => closeNotification(notification.id)}
            >
              <span className="material-icons">close</span>
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
