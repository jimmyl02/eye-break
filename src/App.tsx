import { useEffect, useState } from "react";
import {
  TypographyH3,
  TypographyH4,
  TypographyMuted,
} from "./components/typography";
import { Switch } from "./components/switch";
import { Input } from "./components/input";
import { Button } from "./components/button";

/**
 * Retrieves the value of the "enabled" key from the local storage using the browser API.
 * If the "enabled" key is not found in the storage, the function returns false.
 *
 * @return {Promise<boolean>} The value of the "enabled" key in the local storage.
 */
const getEnabled = async () => {
  const storageResp = await browser.storage.local.get("enabled");
  if (!Object.keys(storageResp).includes("enabled")) {
    return false;
  }

  return storageResp["enabled"] as boolean;
};

/**
 * Sets the value of the 'enabled' property in the local storage.
 *
 * @param {boolean} value - The value to be set for the 'enabled' property.
 * @return {Promise<void>} - A promise that resolves once the value is set.
 */
const setEnabled = async (value: boolean) => {
  await browser.storage.local.set({ enabled: value });
};

/**
 * Retrieves the interval value (minutes) from the local storage.
 *
 * @return {Promise<number>} The interval value. If the interval is not present in the local storage, returns 20.
 */
const getInterval = async () => {
  const storageResp = await browser.storage.local.get("interval");
  if (!Object.keys(storageResp).includes("interval")) {
    return 20;
  }

  return storageResp["interval"] as number;
};

/**
 * Sets the value of the 'interval' property in the local storage.
 *
 * @param {boolean} value - The value to be set for the 'interval' property.
 * @return {Promise<void>} - A promise that resolves once the value is set.
 */
const setIntervalStorage = async (value: number) => {
  await browser.storage.local.set({ interval: value });
};

/**
 * Retrieves the message value from the local storage.
 *
 * @return {Promise<string>} The message value. If the message is not present in the local storage, returns default message.
 */
const getMessage = async () => {
  const storageResp = await browser.storage.local.get("message");
  if (!Object.keys(storageResp).includes("message")) {
    return "Time to give your eyes a break!";
  }

  return storageResp["message"] as string;
};

/**
 * Sets the value of the 'message' property in the local storage.
 *
 * @param {boolean} value - The value to be set for the 'message' property.
 * @return {Promise<void>} - A promise that resolves once the value is set.
 */
const setMessage = async (value: string) => {
  await browser.storage.local.set({ message: value });
};

/**
 * Retrieves the scheduled time of the next alarm.
 *
 * @return {number} The scheduled time of the next alarm (in milliseconds), or 0 if there is no alarm set.
 */
const getNextAlarmTime = async () => {
  const alarmInfo = await browser.alarms.get("eye-break-notification");
  if (alarmInfo === undefined) {
    return 0;
  }

  // alarm info has data
  return alarmInfo.scheduledTime;
};

const App = () => {
  const [enabled, setEnabledState] = useState(false);
  const [interval, setIntervalState] = useState(20);
  const [message, setMessageState] = useState("");
  const [nextTime, setNextTime] = useState(0);

  // handleSave handles saving updating all information
  const handleSave = async () => {
    const prevEnabled = await getEnabled();
    const prevInterval = await getInterval();
    const prevMessage = await getMessage();

    setEnabled(enabled);
    setIntervalStorage(interval);
    setMessage(message);

    if (
      prevEnabled !== enabled ||
      prevInterval !== interval ||
      prevMessage !== message
    ) {
      // there was a change, cancel existing alarm for all cases
      await browser.alarms.clear("eye-break-notification");

      // if new state is enabled, create alarm
      if (enabled) {
        browser.alarms.create("eye-break-notification", {
          periodInMinutes: interval,
        });
      }

      // perform interval update for freshness
      getNextAlarmTime().then((nextAlarm) => {
        setNextTime(nextAlarm - new Date().getTime());
      });
    }
  };

  // startup use effect to set initial state
  useEffect(() => {
    // set initial enabled state
    getEnabled().then((enabled) => {
      setEnabledState(enabled);
    });

    // set initial interval
    getInterval().then((interval) => {
      setIntervalState(interval);
    });

    // set initial message
    getMessage().then((message) => {
      setMessageState(message);
    });
  }, []);

  // effect to update next alarm time
  useEffect(() => {
    // perform initial interval update
    getNextAlarmTime().then((nextAlarm) => {
      setNextTime(nextAlarm - new Date().getTime());
    });

    // create interval to refresh next alarm time
    const alarmInfoInterval = setInterval(async () => {
      const nextAlarm = await getNextAlarmTime();
      setNextTime(nextAlarm - new Date().getTime());
    }, 500);

    return () => clearInterval(alarmInfoInterval);
  }, []);

  return (
    <div className="flex items-center justify-center flex-col py-4 mx-4 gap-2">
      <TypographyH3>Eye Break</TypographyH3>
      <div className="flex flex-col items-start gap-3 min-w-80">
        <div className="flex items-center justify-center flex-row gap-2">
          <Switch checked={enabled} onCheckedChange={setEnabledState} />
          <TypographyH4>Enabled</TypographyH4>
          {nextTime > 0 && (
            <div className="rounded-lg border bg-card shadow-sm px-4 py-2">
              {String(Math.floor(nextTime / 1000 / 60)).padStart(2, "0")}:
              {String(Math.floor(nextTime / 1000) % 60).padStart(2, "0")}
            </div>
          )}
        </div>
        <div className="flex flex-col w-full">
          <Input
            type="number"
            placeholder="20"
            value={interval}
            onChange={(e) => setIntervalState(parseInt(e.target.value))}
          />
          <TypographyMuted>Reminder Interval (Minutes)</TypographyMuted>
        </div>
        <div className="flex flex-col w-full">
          <Input
            type="text"
            placeholder="Time to give your eyes a break!"
            value={message}
            onChange={(e) => setMessageState(e.target.value)}
          />
          <TypographyMuted>Reminder Message</TypographyMuted>
        </div>
        <Button onClick={handleSave}>Save</Button>
      </div>
    </div>
  );
};

export default App;
