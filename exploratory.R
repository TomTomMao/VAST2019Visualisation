library(dplyr)  # For the select() function
library(tidyr)
library(ggplot2)

setwd("C:/Users/asus/OneDrive/Nottingham/Information visualization/group project")
reports <- read.csv("mc1-reports-data.csv", quote="\"", header=T, comment.char="")

reports$time
reports$time_date <- substr(reports$time, 1, 10)
reports$time_clock <- substr(reports$time, 12, 19)

factor(reports$time_date)
n_clock <- reports$time_clock %>%
  factor() %>%
  levels() %>%
  length()

print("number of different time_clocks:")
print(24*60/(n_clock - 1))

#filter by timespan
filterByTime <- function(data, start, end) {
  data_filtered <- data %>%
    filter(data$time>=start & data$time < end)
}

# iterate through dates, print the number of different of each day
for (i in 1:length(levels(factor(reports$time_date)))) {
  # print(levels(factor(reports$time_date))[i])
  reports_tmp <- filter(reports, reports$time_date==levels(factor(reports$time_date))[i])
  n_clock <- reports_tmp$time_clock %>%
    factor() %>%
    levels() %>%
    length()
  
  print("number of different time_clocks:")
  print(24*60/(n_clock - 1))
}
reports

#--------manipulating data--------
str(reports)
  # convert to long
  reports_mod <- gather(reports, facility, damage_value, sewer_and_water, power, roads_and_bridges, medical, buildings)
  # discard_null value
  reports_mod <- reports_mod %>%
    filter(!is.na(reports_mod$damage_value))
  # convert location to factor
  reports_mod$location <- factor(reports_mod$location)
  # save to local
  write.csv(reports_mod, "C:/Users/asus/OneDrive/Nottingham/Information visualization/group project/mc1-reports-data-md.csv", row.names=FALSE)
# question 1: given a time span, visualize 5 types of facilities' damage boxplot(not good)
              
  draw_boxes <- function(reports_data,start,end) {
    # require: tidyr, dplyr, ggplot2
    # reports_data: five columns {time, shake_intensity, location, facility, damage_vallue}
    # start, end: string like this: 2020-04-07 17:25:00
    # return: ggplot object between the time [start, end)
    reports_filtered <- reports_data %>%
      filter(reports_data$time>=start & reports_data$time < end)
    ggplot(reports_filtered, aes(x = location, y = damage_value, group = location)) +
      geom_boxplot() + 
      facet_grid(facility~.)
    # doesn't look good
  }
  
draw_boxes(reports_mod, "2020-04-06 00:00:00", "2020-04-07 00:00:00")

draw_dots <- function(reports_data,start,end,emphasize = 1) {
  # require: tidyr, dplyr, ggplot2
  # reports_data: five columns {time, shake_intensity, location, facility, damage_vallue}
  # start, end: string like this: 2020-04-07 17:25:00
  # return: ggplot object between the time [start, end)
  colours = c("gray", "gray", "gray", "gray", "gray")
  colours[emphasize] = "red"
  reports_filtered <- reports_data %>%
    filter(reports_data$time>=start & reports_data$time < end)
  ggplot(reports_filtered, aes(x = location, y = facility, group = location, colour=facility)) +
    geom_point(position = "jitter") + 
    facet_wrap(.~location) +
    scale_colour_manual(values = colours)
  # seems better
}
draw_dots(reports_mod, "2020-04-07 20:00:00", "2020-04-08 00:00:00")


  
draw_dots2 <- function(reports_data,start,end,emphasize = 1) {
  # require: tidyr, dplyr, ggplot2
  # reports_data: five columns {time, shake_intensity, location, facility, damage_vallue}
  # start, end: string like this: 2020-04-07 17:25:00
  # return: ggplot object between the time [start, end)
    reports_filtered <- reports_mod %>%
      filterByTime("2020-04-07 20:00:00", "2020-04-08 00:00:00") %>%
      group_by(location, facility) %>%
      summarise(
        avgDamage = mean(damage_value),
        sdDamage = sd(damage_value),
        n = n(),
        se = sdDamage/sqrt(n)
      )
    reports_filtered %>%
      ggplot(aes(x = location, y = facility, colours = avgDamage)) +
        geom_point(position="jitter")
    # seems better
}
draw_dots2(reports_mod, "2020-04-07 20:00:00", "2020-04-08 00:00:00")
ggplot(reports_mod, aes(x = 1, y = damage_value)) +
  geom_point(position = "jitter") +
  facet_grid(location~facility)

# q1: tile diagram

reports_stat <- reports_mod %>%
  filterByTime("2020-04-05 20:00:00", "2020-04-18 00:00:00") %>%
  group_by(location, facility) %>%
  summarise(
    avgDamage = mean(damage_value),
    sdDamage = sd(damage_value),
    n = n(),
    se = sdDamage/sqrt(n)
  )
reports_stat %>% 
  ggplot(aes(x = location, y = facility, fill = avgDamage)) +
  geom_tile() +
  ggtitle("2020-04-05 20:00:00 to 2020-04-18 00:00:00") +
  scale_fill_gradient2(high = "red")
?scale_fill_gradient2

# time series
create_list <- function(n, i) {
  if (i < 1 || i > n) {
    stop("i must be between 1 and n")
  }
  colors <- rep("gray", n)
  colors[i] <- "red"
    return(colors)
}
reports_timemod <- reports_mod 

reports_timemod$datetime <- as.POSIXct(reports_timemod$time)
reports_timemod$hourly_group <- cut(reports_timemod$datetime, breaks = "4 hours")
reports_timemod_hourly_summary <- reports_timemod %>%
  group_by(hourly_group, location, facility) %>%
  summarise(
    avgDamage = mean(damage_value),
    sdDamage = sd(damage_value),
    n = n(),
    se = sdDamage/sqrt(n)
  )
  
  colours <- create_list(19,1)
  ggplot(reports_timemod_hourly_summary, aes(x = hourly_group, y = avgDamage, group=location)) +
  geom_line(aes(colour = location)) +
  facet_grid(facility~.) +
  scale_colour_manual(values = colours)
  