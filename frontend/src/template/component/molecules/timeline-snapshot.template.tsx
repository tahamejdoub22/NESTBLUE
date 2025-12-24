import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { TimelineSnapshot as TimelineSnapshotType } from "@/interfaces/dashboard.interface";
import { cn } from "@/lib/utils";
import { Calendar, AlertTriangle, ArrowUpRight } from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";

export interface TimelineSnapshotTemplateProps {
  data: TimelineSnapshotType;
  className?: string;
}

export function renderTimelineSnapshot(props: TimelineSnapshotTemplateProps) {
  const { data, className } = props;

  // Convert string dates to Date objects for sorting and comparison
  const deadlinesWithDates = data.upcomingDeadlines.map(d => ({
    ...d,
    date: d.date instanceof Date ? d.date : new Date(d.date)
  }));

  const sortedDeadlines = [...deadlinesWithDates].sort(
    (a, b) => {
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    }
  );

  const now = new Date();
  const overdueCount = sortedDeadlines.filter(d => {
    const date = d.date instanceof Date ? d.date : new Date(d.date);
    return date < now;
  }).length;
  const thisWeekCount = sortedDeadlines.filter(d => {
    const date = d.date instanceof Date ? d.date : new Date(d.date);
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return date >= now && date <= weekFromNow;
  }).length;
  const laterCount = sortedDeadlines.length - overdueCount - thisWeekCount;

  const totalDeadlines = sortedDeadlines.length;
  const overduePercentage = totalDeadlines > 0 ? (overdueCount / totalDeadlines) * 100 : 0;
  const thisWeekPercentage = totalDeadlines > 0 ? (thisWeekCount / totalDeadlines) * 100 : 0;
  const blockedPercentage = data.blockedTasks.length > 0 ? 100 : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className={cn("space-y-4", className)}
    >
      {/* Upcoming Deadlines - Statistics Card */}
      <motion.div variants={staggerItem}>
        <Card className="relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-4 w-4" />
              </div>
              Upcoming Deadlines
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {totalDeadlines} items
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary/50" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-4 pt-0">
          {totalDeadlines === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              No upcoming deadlines
            </div>
          ) : (
            <>
              {/* Statistics Grid */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { count: overdueCount, label: "Overdue", percentage: overduePercentage, variant: "default" },
                  { count: thisWeekCount, label: "This Week", percentage: thisWeekPercentage, variant: "primary" },
                  { count: laterCount, label: "Later", percentage: 100 - overduePercentage - thisWeekPercentage, variant: "default" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    variants={staggerItem}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={cn(
                      "text-center p-3 rounded-lg transition-colors",
                      stat.variant === "primary"
                        ? "bg-primary/5 hover:bg-primary/10 border border-primary/10"
                        : "bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1, type: "spring" }}
                      className="text-2xl font-bold mb-1"
                      style={{ color: stat.variant === "primary" ? "hsl(var(--primary))" : "hsl(var(--foreground))" }}
                    >
                      {stat.count}
                    </motion.div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(stat.percentage, 100)}%` }}
                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          stat.variant === "primary" ? "bg-primary" : "bg-primary/30"
                        )}
                      />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Blocked Tasks - Statistics Card */}
      <motion.div variants={staggerItem}>
        <Card className="relative overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardHeader className="relative z-10 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <AlertTriangle className="h-4 w-4" />
              </div>
              Blocked Tasks
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                {data.blockedTasks.length} items
              </span>
              <ArrowUpRight className="h-4 w-4 text-primary/50" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-0">
          {data.blockedTasks.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary/30 mb-1">0</div>
                <p className="text-xs">No blocked tasks</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="text-4xl font-bold text-primary mb-1"
              >
                {data.blockedTasks.length}
              </motion.div>
              <p className="text-xs text-muted-foreground mb-3">Tasks requiring attention</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${blockedPercentage}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}



