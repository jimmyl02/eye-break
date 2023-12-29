/* eslint-disable no-undef */
/**
 * Creates a notification with the given title and message.
 *
 * @param {string} title - The title of the notification.
 * @param {string} message - The message of the notification.
 */
const createNotification = async (title, message) => {
  await browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("logo48.png"),
    title: title,
    message: message,
  });
};

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

  return storageResp["enabled"];
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

  return storageResp["interval"];
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

  return storageResp["message"];
};

// startupHandler handles when the browser starts up and initializes the alarm
const startupHandler = async () => {
  const enabled = getEnabled();
  if (enabled) {
    // notification should be enabled
    const interval = getInterval();

    // there was a change, cancel existing alarm for all cases
    await browser.alarms.clear("eye-break-notification");

    // if new state is enabled, create alarm
    browser.alarms.create("eye-break-notification", {
      periodInMinutes: interval,
    });
  }
};

// alarmHandler handles when an alarm is triggered
const alarmHandler = async (alarmInfo) => {
  const alarmName = alarmInfo.name;
  if (alarmName !== "eye-break-notification") {
    console.error("Unexpected alarm name: " + alarmName);
  }

  // create notification for notification
  const message = await getMessage();
  await createNotification("Eye Break!", message);
};

// attach listeners
browser.runtime.onStartup.addListener(startupHandler);
browser.alarms.onAlarm.addListener(alarmHandler);
