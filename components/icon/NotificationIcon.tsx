"use client"
import { useState, useEffect, useRef } from "react"
import { Bell, X, CheckCheck, Clock } from "lucide-react"
import { Notification } from "@/lib/types"
import { apiClient } from "@/lib/api-client"



interface NotificationDropdownProps {
  notifications: Notification[]
  onClose: () => void
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
  isLoading?: boolean
}

interface NotificationItemProps {
  notification: Notification
  onMarkAsRead: (id: number) => void
}

// ==================== HELPER FUNCTIONS ====================
function formatTime(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000)

  // Đã bỏ các hàm liên quan đến 'loai' (getNotificationIcon, getNotificationLabel, getNotificationBgColor)

  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`

  return time.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ==================== NOTIFICATION ITEM COMPONENT ====================
function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const isUnread = !notification.da_doc
  // Màu nền được cố định dựa trên trạng thái đã đọc/chưa đọc
  const bgColor = isUnread ? 'bg-blue-50' : 'bg-gray-50'
  const iconProps = { size: 20 }

  return (
    <div
      className={`p-4 border-b border-gray-100 hover:bg-gray-100 transition-all duration-200 cursor-pointer ${bgColor}`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className="flex gap-3">
        {/* Icon (Cố định là Bell) */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUnread ? 'bg-white shadow-sm' : 'bg-gray-200'
          }`}>
          {/* Cố định Icon là Bell */}
          <Bell {...iconProps} className="text-blue-600" />
        </div>

        {/* Nội dung */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${isUnread ? 'font-semibold text-gray-900' : 'text-gray-700'
            }`}>
            {notification.tieu_de}
          </p>

          {notification.noi_dung && notification.noi_dung !== 'hello' && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.noi_dung}
            </p>
          )}

          <div className="flex items-center justify-end mt-2 gap-2">
            {/* Đã xóa nhãn (label) loại thông báo */}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock size={12} />
              <span>{formatTime(notification.ngay_tao)}</span>
            </div>
          </div>
        </div>

        {/* Chấm đỏ chưa đọc */}
        {isUnread && (
          <div className="flex-shrink-0 pt-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== NOTIFICATION DROPDOWN COMPONENT ====================
function NotificationDropdown({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  isLoading = false
}: NotificationDropdownProps) {
  const unreadCount = notifications.filter(n => !n.da_doc).length

  return (
    <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">Thông báo</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-600 mt-0.5">
                Bạn có {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-3 py-1.5 bg-white rounded-md hover:bg-blue-50 transition-colors border border-blue-200"
                title="Đánh dấu tất cả đã đọc"
              >
                <CheckCheck size={14} className="inline mr-1" />
                Đọc hết
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 hover:bg-white p-1.5 rounded-md transition-colors"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách thông báo */}
      <div className="overflow-y-auto flex-1 bg-gray-50">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-3 text-sm">Đang tải thông báo...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={40} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700 mb-1">Chưa có thông báo</p>
            <p className="text-sm text-gray-500">
              Các thông báo về quyên góp của bạn sẽ hiển thị ở đây
            </p>
          </div>
        ) : (
          <div className="bg-white">
            {notifications.map((notif) => (
              <NotificationItem
                key={notif.id}
                notification={notif}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded-md transition-colors"
            onClick={() => {
              // TODO: Navigate to notifications page
              console.log('View all notifications')
            }}
          >
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  )
}

// ==================== NOTIFICATION ICON COMPONENT ====================
export default function NotificationIcon() {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)

      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        const authStorage = localStorage.getItem('auth-storage')
        const userId = authStorage ? JSON.parse(authStorage).state.user.id : null
        const response = await apiClient.getThongBao({
          ma_nguoi_dung: `eq.${userId}`
        })
        console.log("responssssssssssssss", response)
        setNotifications(response as unknown as Notification[])     
        console.log("ggggggggggggggggggggg", notifications)  
        //  setUnreadCount(response.filter(n => !n.da_doc).length)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  // Mark single notification as read
  const handleMarkAsRead = (id: number): void => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, da_doc: true } : n)
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    // TODO: Call API to mark as read
    // fetch(`/api/notifications/${id}/read`, { method: 'PUT' })
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = (): void => {
    setNotifications(prev => prev.map(n => ({ ...n, da_doc: true })))
    setUnreadCount(0)

    // TODO: Call API to mark all as read
    // fetch('/api/notifications/mark-all-read', { method: 'PUT' })
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
        aria-label="Thông báo"
        aria-expanded={isOpen}
      >
        <Bell size={24} className={isOpen ? 'text-blue-600' : ''} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}





//  - VNPAY : 
//         NCB
//         9704198526191432198
//         NGUYEN VAN A   
//         07/15
//         123456 