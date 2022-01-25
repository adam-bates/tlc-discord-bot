module.exports = {
  builder: (command) =>
    command
      .setName("listrsns")
      .setDescription("List all Discord user's RSN assignments")
      .addBooleanOption((option) =>
        option
          .setName("public")
          .setDescription(
            "Make the output of this command public to the server"
          )
          .setRequired(false)
      ),

  execute: async ({ client, redis }, interaction) => {
    const isPublic = interaction.options.getBoolean("public");

    const rsns = await redis.getAllRsns();
    const map = new Map();

    const promises = rsns.map(async (rsn) => {
      const userId = await redis.searchForUserIdWithRsn(rsn);

      if (userId) {
        const user = await client.users.cache.get(userId);
        map.set(rsn, user);
      } else {
        map.set(rsn, null);
      }
    });
    await Promise.all(promises);

    if (map.size === 0) {
      await interaction.reply({
        content: "No users have been assigned to any RSNs.",
        ephemeral: !isPublic,
      });
    }

    let content = "Assigned RSNs:";

    map.forEach((user, rsn) => {
      if (user) {
        content = `${content}\n- ${user} is assigned to RSN: ${rsn}`;
      }
    });

    await interaction.reply({
      content,
      ephemeral: !isPublic,
    });
  },
};
