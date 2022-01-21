const addPadding = (n, requiredLength) => {
  let s = `${n}`;

  while (s.length < requiredLength) {
    s = `${s} `;
  }

  return s;
};

const addFormatAndPadding = (n, requiredLength) => {
  let s = n.toLocaleString();

  while (s.length < requiredLength) {
    s = `${s} `;
  }

  return s;
};

const formatStatsOutput = (stats) => {
  const level = addPadding(stats.Overall.level, 4);
  const xp = addFormatAndPadding(stats.Overall.xp, 13);

  let output = `
# Player Stats
## RSN: ${stats.rsn}
### Rank: ${stats.rank}

\`\`\`
.-------------------------------------------------------------------------------------------------------------------------------------------------------.
|               |               Total                |             Today              |           Yesterday            |           This Week            |
|     Skill     |------------------------------------|--------------------------------|--------------------------------|--------------------------------|
|               | Level |       XP       |   Rank    | Level |     XP     |   Rank    | Level |     XP     |   Rank    | Level |     XP     |   Rank    |
|---------------|-------+----------------+-----------|-------+------------+-----------|-------+------------+-----------|-------+------------+-----------|
| Overall       | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Attack        | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Defence       | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Strength      | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Constitution  | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Ranged        | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Prayer        | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Magic         | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Cooking       | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Woodcutting   | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Fletching     | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Fishing       | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Firemaking    | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Crafting      | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Smithing      | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Mining        | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Herblore      | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Agility       | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Thieving      | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Slayer        | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Farming       | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Runecrafting  | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Hunter        | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Construction  | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Summoning     | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Dungeoneering | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Divination    | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Invention     | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
| Archaeology   | 0000  |  0,000,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 | 0000  | 00,000,000 | 0,000,000 |
'-------------------------------------------------------------------------------------------------------------------------------------------------------'
\`\`\`
###### Data from ${new Date(stats.timestamp).toUTCString()}
`;

  if (stats.activities) {
    // TODO
    output = `${output}`;
  }

  if (stats.monthlyXp) {
    // TODO
    output = `${output}`;
  }

  if (stats.quests) {
    // TODO
    output = `${output}`;
  }

  return output;
};

module.exports = {
  formatStatsOutput,
};
