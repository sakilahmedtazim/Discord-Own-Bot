import os, asyncio, logging
from pathlib import Path
import discord
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")
if TOKEN is None:
    raise RuntimeError("🔑  Set DISCORD_TOKEN in environment or .env file")

intents = discord.Intents.default()
intents.message_content = True
intents.members = True

bot = commands.Bot(command_prefix="!", intents=intents)
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

async def load_extensions():
    await bot.load_extension("bot_core")
    for path in Path("cogs").glob("*.py"):
        if not path.stem.startswith("__"):
            await bot.load_extension(f"cogs.{path.stem}")

async def main():
    await load_extensions()
    await bot.start(TOKEN)

if __name__ == "__main__":
    asyncio.run(main())
