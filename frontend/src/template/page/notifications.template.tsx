import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Text } from "@/components/atoms/text";
import { NotificationItem } from "@/components/atoms/notification-item";
import { NotificationFilters } from "@/components/molecules/notification-filters";
import { Notification, NotificationType } from "@/interfaces";
import { 
  CheckCheck, 
  Trash2, 
  Bell, 
  BellOff,
  Filter,
  X
} from "lucide-react";

export interface NotificationsPageTemplateProps {
  notifications: Notification[];
  filteredNotifications: Notification[];
  selectedType: NotificationType | "all";
  selectedStatus: "all" | "unread" | "read";
  showFilters: boolean;
  unreadCount: number;
  hasActiveFilters: boolean;
  onTypeChange: (type: NotificationType | "all") => void;
  onStatusChange: (status: "all" | "unread" | "read") => void;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onNotificationClick: (notification: Notification) => void;
}

export function renderNotificationsPage(props: NotificationsPageTemplateProps) {
  const {
    notifications,
    filteredNotifications,
    selectedType,
    selectedStatus,
    showFilters,
    unreadCount,
    hasActiveFilters,
    onTypeChange,
    onStatusChange,
    onToggleFilters,
    onClearFilters,
    onMarkAsRead,
    onMarkAllAsRead,
    onDelete,
    onDeleteAll,
    onNotificationClick,
  } = props;

  const unreadFiltered = filteredNotifications.filter((n) => !n.read);
  const readFiltered = filteredNotifications.filter((n) => n.read);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {[selectedType !== "all", selectedStatus !== "all"].filter(Boolean).length}
              </span>
            )}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMarkAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDeleteAll}
              className="gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete all
            </Button>
          )}
        </div>
      </PageHeader>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="p-4 animate-fade-in">
          <NotificationFilters
            selectedType={selectedType}
            onTypeChange={onTypeChange}
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
            onClearFilters={onClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="body-sm" className="text-muted-foreground">
                Total Notifications
              </Text>
              <Text variant="h4" className="mt-1">
                {notifications.length}
              </Text>
            </div>
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="body-sm" className="text-muted-foreground">
                Unread
              </Text>
              <Text variant="h4" className="mt-1">
                {unreadCount}
              </Text>
            </div>
            <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <BellOff className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="body-sm" className="text-muted-foreground">
                Filtered Results
              </Text>
              <Text variant="h4" className="mt-1">
                {filteredNotifications.length}
              </Text>
            </div>
            <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
              <Filter className="h-6 w-6 text-info" />
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
            <Text variant="h5" className="mb-2">
              {hasActiveFilters ? "No notifications match your filters" : "No notifications"}
            </Text>
            <Text variant="body-sm" className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "Try adjusting your filters to see more notifications"
                : "You're all caught up! New notifications will appear here."}
            </Text>
            {hasActiveFilters && (
              <Button variant="outline" onClick={onClearFilters} className="gap-2">
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Unread Notifications */}
          {unreadFiltered.length > 0 && (
            <div className="space-y-2">
              <Text variant="body-sm" weight="semibold" className="text-muted-foreground px-2">
                Unread ({unreadFiltered.length})
              </Text>
              {unreadFiltered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                  onDelete={() => onDelete(notification.id)}
                  onClick={() => onNotificationClick(notification)}
                />
              ))}
            </div>
          )}

          {/* Read Notifications */}
          {readFiltered.length > 0 && (
            <div className="space-y-2">
              {unreadFiltered.length > 0 && (
                <Text variant="body-sm" weight="semibold" className="text-muted-foreground px-2 mt-4">
                  Read ({readFiltered.length})
                </Text>
              )}
              {readFiltered.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => onMarkAsRead(notification.id)}
                  onDelete={() => onDelete(notification.id)}
                  onClick={() => onNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



