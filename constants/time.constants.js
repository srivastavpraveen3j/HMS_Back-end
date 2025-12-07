// src/app/constants/time.constants.js

export const TimeConstants = {
  MS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
};

// Derived conversions
export const TimeUtils = {
  secondsToMs: (seconds) => seconds * TimeConstants.MS_PER_SECOND,
  minutesToMs: (minutes) =>
    minutes * TimeConstants.SECONDS_PER_MINUTE * TimeConstants.MS_PER_SECOND,

  hoursToMs: (hours) =>
    hours *
    TimeConstants.MINUTES_PER_HOUR *
    TimeConstants.SECONDS_PER_MINUTE *
    TimeConstants.MS_PER_SECOND,

  daysToMs: (days) =>
    days *
    TimeConstants.HOURS_PER_DAY *
    TimeConstants.MINUTES_PER_HOUR *
    TimeConstants.SECONDS_PER_MINUTE *
    TimeConstants.MS_PER_SECOND,
};
