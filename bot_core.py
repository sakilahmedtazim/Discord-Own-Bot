import discord, logging
from discord.ext import commands

class Core(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @commands.Cog.listener()
    async def on_ready(self):
        logging.info(f"✅  Logged in as {self.bot.user} (ID {self.bot.user.id})")
        try:
            synced = await self.bot.tree.sync()
            logging.info(f"🌐  Synced {len(synced)} slash command(s) globally")
        except Exception:
            logging.exception("Slash sync failed")

async def setup(bot: commands.Bot):
    await bot.add_cog(Core(bot))
