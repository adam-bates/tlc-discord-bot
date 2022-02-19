/* eslint-disable no-param-reassign */

const { createClient } = require("redis");
const {
  unixTimestamp,
  dropTime,
  fromUnixTimestamp,
} = require("../../utils/time");

const GET_ALL_PLAYERS = "GetAllPlayers";

const GET_RSN = "GetRsn";

const GET_LATEST_STATS = "GetStats/latest";
const GET_TODAY_STATS = "GetStats/today";
const GET_YESTERDAY_STATS = "GetStats/yesterday";
const GET_WEEK_STATS = "GetStats/week";

const GET_SNAPSHOT = "GetSnapshot";

const GET_EVENT_DETAILS = "GetEventDetails";
const GET_EVENT_START_SNAPSHOT = "GetEventStartSnapshot";
const GET_EVENT_END_SNAPSHOT = "GetEventEndSnapshot";

const GET_ROLE_ID = "GetRoleId";

const key = (...parts) => parts.join("/");
const { parse, stringify } = JSON;

const Redis = (client) => {
  const getAllPlayers = async () =>
    parse(await client.get(GET_ALL_PLAYERS)) || [];

  const unsafeSetAllPlayers = async (players) =>
    client.set(key(GET_ALL_PLAYERS), stringify(players));

  const getAllRsns = async () => (await getAllPlayers()).map(({ rsn }) => rsn);

  const getRsnByUserId = async (userId) => client.get(key(GET_RSN, userId));

  const setRsnByUserId = async (userId, rsn) => {
    await client.set(key(GET_RSN, userId), rsn);
  };

  const deleteRsnByUserId = async (userId) => {
    await client.del(key(GET_RSN, userId));
  };

  const searchForUserIdWithRsn = async (rsn) => {
    const keys = await client.sendCommand(["KEYS", key(GET_RSN, "*")]);

    const assignments = await Promise.all(
      keys.map(async (k) => {
        const userId = k.split("/")[1];

        return {
          userId,
          rsn: await client.get(key(GET_RSN, userId)),
        };
      })
    );

    const found = assignments.find((assignment) => assignment.rsn === rsn);

    return found && found.userId;
  };

  const getStatsByRsn = async (rsn) =>
    parse(await client.get(key(GET_LATEST_STATS, rsn)));

  const setStatsByRsn = async (rsn, stats) =>
    client.set(key(GET_LATEST_STATS, rsn), stringify(stats));

  const getTodayStatsByRsn = async (rsn) =>
    parse(await client.get(key(GET_TODAY_STATS, rsn)));

  const setTodayStatsByRsn = async (rsn, stats) =>
    client.set(key(GET_TODAY_STATS, rsn), stringify(stats));

  const getYesterdayStatsByRsn = async (rsn) =>
    parse(await client.get(key(GET_YESTERDAY_STATS, rsn)));

  const setYesterdayStatsByRsn = async (rsn, stats) =>
    client.set(key(GET_YESTERDAY_STATS, rsn), stringify(stats));

  const getWeekStatsByRsn = async (rsn) =>
    parse(await client.get(key(GET_WEEK_STATS, rsn)));

  const setWeekStatsByRsn = async (rsn, stats) =>
    client.set(key(GET_WEEK_STATS, rsn), stringify(stats));

  const getStatsSnapshotByRsnAndTimestamp = async (rsn, timestamp) =>
    parse(await client.get(key(GET_SNAPSHOT, rsn, timestamp)));

  const setStatsSnapshotByRsnAndTimestamp = async (rsn, timestamp, stats) =>
    client.set(key(GET_SNAPSHOT, rsn, timestamp), stringify(stats));

  const deleteStatsSnapshotByRsnAndTimestamp = async (rsn, timestamp) =>
    client.del(key(GET_SNAPSHOT, rsn, timestamp));

  const getStatSnapshotTimestampsByRsn = async (rsn) => {
    const keys = await client.sendCommand([
      "KEYS",
      `${key(GET_SNAPSHOT, rsn)}/*`,
    ]);

    return keys.map((k) => k.split("/")[2]);
  };

  const updatePlayers = async (players, options) => {
    const renames = (options && options.renames) || [];

    let oldPlayers = await getAllPlayers();
    const oldPlayersMap = oldPlayers.reduce(
      (map, oldPlayer) => map.set(oldPlayer.rsn, oldPlayer),
      new Map()
    );

    await Promise.all(
      renames.map(async ([fromRsn, toRsn]) => {
        const userId = await searchForUserIdWithRsn(fromRsn);
        await setRsnByUserId(userId, toRsn);

        const player = oldPlayersMap.get(fromRsn);
        oldPlayersMap.delete(player);
        player.rsn = toRsn;
        oldPlayersMap.set(toRsn, player);

        await setStatsByRsn(toRsn, await getStatsByRsn(fromRsn));
        await setTodayStatsByRsn(toRsn, await getTodayStatsByRsn(fromRsn));
        await setYesterdayStatsByRsn(
          toRsn,
          await getYesterdayStatsByRsn(fromRsn)
        );
        await setWeekStatsByRsn(toRsn, await getWeekStatsByRsn(fromRsn));

        await client.del(key(GET_LATEST_STATS, fromRsn));
        await client.del(key(GET_TODAY_STATS, fromRsn));
        await client.del(key(GET_YESTERDAY_STATS, fromRsn));
        await client.del(key(GET_WEEK_STATS, fromRsn));
      })
    );

    oldPlayers = Array.from(oldPlayersMap.values());

    const rsnsSet = new Set(players.map(({ rsn }) => rsn));
    const removedRsns = oldPlayers.filter(({ rsn }) => !rsnsSet.has(rsn));

    await client.set(
      GET_ALL_PLAYERS,
      stringify(
        players.map((player) => {
          const oldPlayer = oldPlayersMap.get(player.rsn);
          return {
            ...player,
            dateJoined:
              (oldPlayer && oldPlayer.dateJoined) ||
              unixTimestamp(dropTime(new Date())),
          };
        })
      )
    );

    const promises = removedRsns.map(async (rsn) => {
      await client.del(key(GET_LATEST_STATS, rsn));
      await client.del(key(GET_TODAY_STATS, rsn));
      await client.del(key(GET_YESTERDAY_STATS, rsn));
      await client.del(key(GET_WEEK_STATS, rsn));

      const userId = await searchForUserIdWithRsn(rsn);
      if (userId) {
        await client.del(key(GET_RSN, userId));
      }

      // Note: Don't delete snapshots! They may be used in event results.
    });

    await Promise.all(promises);
  };

  const getRoleIdByLevel = async (level) => client.get(key(GET_ROLE_ID, level));

  const setRoleIdByLevel = async (level, roleId) =>
    client.set(key(GET_ROLE_ID, level), roleId);

  const deleteRoleIdByLevel = async (level) =>
    client.del(key(GET_ROLE_ID, level));

  const getAllLevelRoleIdAssignments = async () => {
    const keys = await client.sendCommand(["KEYS", key(GET_ROLE_ID, "*")]);

    const promises = keys.map(async (k) => {
      const level = k.split("/")[1];
      const roleId = await client.get(k);
      return { level, roleId };
    });

    return Promise.all(promises);
  };

  const searchForLevelWithRoleId = async (roleId) => {
    const assignments = await getAllLevelRoleIdAssignments();

    const found = assignments.find(
      (assignment) => assignment.roleId === roleId
    );

    return found && found.level;
  };

  const startEvent = async (name, start) => {
    const existing = await client.get(key(GET_EVENT_DETAILS, name));

    if (existing) {
      return `Event with name "${name}" already exists!`;
    }

    await client.set(key(GET_EVENT_DETAILS, name), stringify({ name, start }));

    const rsns = await getAllRsns();

    const promises = rsns.map(async (rsn) => {
      const stats = await getStatsByRsn(rsn);

      client.set(key(GET_EVENT_START_SNAPSHOT, name, rsn), stringify(stats));
    });

    await Promise.all(promises);

    return null;
  };

  const endEvent = async (name, end) => {
    const details = parse(await client.get(key(GET_EVENT_DETAILS, name)));

    if (!details) {
      return `Event with name "${name}" doesn't exist!`;
    }

    if (details.end) {
      const formatted = fromUnixTimestamp(details.end).toUTCString();

      return `Event with name "${name}" was already ended at ${formatted}`;
    }

    await client.set(
      key(GET_EVENT_DETAILS, name),
      stringify({ name, start: details.start, end })
    );

    const rsns = await getAllRsns();

    const promises = rsns.map(async (rsn) => {
      const stats = await getStatsByRsn(rsn);

      client.set(key(GET_EVENT_END_SNAPSHOT, name, rsn), stringify(stats));
    });

    await Promise.all(promises);

    return null;
  };

  const addStatsToEvent = async (name, rsn, stats) => {
    const details = await client.get(key(GET_EVENT_DETAILS, name));

    if (!details) {
      return `Event with name "${name}" doesn't exist!`;
    }

    await client.set(
      key(GET_EVENT_START_SNAPSHOT, name, rsn),
      stringify(stats)
    );

    return null;
  };

  const getEventDetails = async (name) =>
    parse(await client.get(key(GET_EVENT_DETAILS, name)));

  const getStartEventStatsByRsn = async (name, rsn) =>
    parse(await client.get(key(GET_EVENT_START_SNAPSHOT, name, rsn)));

  const getEndEventStatsByRsn = async (name, rsn) =>
    parse(await client.get(key(GET_EVENT_END_SNAPSHOT, name, rsn)));

  const getAllEventNames = async () => {
    const detailKeys = await client.sendCommand([
      "KEYS",
      key(GET_EVENT_DETAILS, "*"),
    ]);

    const allEventNames = detailKeys.map(
      (detailKey) => detailKey.split("/")[1]
    );

    return allEventNames;
  };

  const getAllEventDetails = async () => {
    const allEventNames = await getAllEventNames();

    const promises = allEventNames.map(async (eventName) =>
      parse(await client.get(key(GET_EVENT_DETAILS, eventName)))
    );

    return Promise.all(promises);
  };

  const getCurrentEventNames = async () => {
    const allEventNames = await getAllEventNames();

    const currentEventNamesSet = new Set(allEventNames);

    const promises = allEventNames.map(async (eventName) => {
      const eventEndKeys = await client.sendCommand([
        "KEYS",
        key(GET_EVENT_END_SNAPSHOT, eventName, "*"),
      ]);

      if (eventEndKeys && eventEndKeys.length > 0) {
        currentEventNamesSet.delete(eventName);
      }
    });
    await Promise.all(promises);

    return Array.from(currentEventNamesSet);
  };

  const getCurrentEventDetails = async () => {
    const currentEventNames = await getCurrentEventNames();

    const promises = currentEventNames.map(async (eventName) =>
      parse(await client.get(key(GET_EVENT_DETAILS, eventName)))
    );

    return Promise.all(promises);
  };

  client.getAllPlayers = getAllPlayers;
  client.unsafeSetAllPlayers = unsafeSetAllPlayers;
  client.getAllRsns = getAllRsns;
  client.updatePlayers = updatePlayers;
  client.getRsnByUserId = getRsnByUserId;
  client.setRsnByUserId = setRsnByUserId;
  client.deleteRsnByUserId = deleteRsnByUserId;
  client.searchForUserIdWithRsn = searchForUserIdWithRsn;
  client.getStatsByRsn = getStatsByRsn;
  client.setStatsByRsn = setStatsByRsn;
  client.getTodayStatsByRsn = getTodayStatsByRsn;
  client.setTodayStatsByRsn = setTodayStatsByRsn;
  client.getYesterdayStatsByRsn = getYesterdayStatsByRsn;
  client.setYesterdayStatsByRsn = setYesterdayStatsByRsn;
  client.getWeekStatsByRsn = getWeekStatsByRsn;
  client.setWeekStatsByRsn = setWeekStatsByRsn;
  client.getStatsSnapshotByRsnAndTimestamp = getStatsSnapshotByRsnAndTimestamp;
  client.setStatsSnapshotByRsnAndTimestamp = setStatsSnapshotByRsnAndTimestamp;
  client.deleteStatsSnapshotByRsnAndTimestamp =
    deleteStatsSnapshotByRsnAndTimestamp;
  client.getStatSnapshotTimestampsByRsn = getStatSnapshotTimestampsByRsn;
  client.getRoleIdByLevel = getRoleIdByLevel;
  client.setRoleIdByLevel = setRoleIdByLevel;
  client.deleteRoleIdByLevel = deleteRoleIdByLevel;
  client.getAllLevelRoleIdAssignments = getAllLevelRoleIdAssignments;
  client.searchForLevelWithRoleId = searchForLevelWithRoleId;
  client.startEvent = startEvent;
  client.endEvent = endEvent;
  client.addStatsToEvent = addStatsToEvent;
  client.getEventDetails = getEventDetails;
  client.getStartEventStatsByRsn = getStartEventStatsByRsn;
  client.getEndEventStatsByRsn = getEndEventStatsByRsn;
  client.getAllEventNames = getAllEventNames;
  client.getAllEventDetails = getAllEventDetails;
  client.getCurrentEventNames = getCurrentEventNames;
  client.getCurrentEventDetails = getCurrentEventDetails;

  return client;
};

const connectRedisClient = async () => {
  const client = createClient({
    url: process.env.REDIS_URL,
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  await client.connect();

  return Redis(client);
};

module.exports = {
  connectRedisClient,
};
