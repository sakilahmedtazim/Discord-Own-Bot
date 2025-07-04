import discord
from discord.ext import commands

class Admin(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # -------- Kick / Ban / Purge --------
    @commands.hybrid_command(description="Kick a member (Kick Members perm)")
    @commands.has_permissions(kick_members=True)
    async def kick(self, ctx: commands.Context, member: discord.Member, *, reason: str="No reason"):
        await member.kick(reason=reason)
        await ctx.reply(f"🚫 {member} kicked – {reason}")

    @commands.hybrid_command(description="Ban a member (Ban Members perm)")
    @commands.has_permissions(ban_members=True)
    async def ban(self, ctx: commands.Context, member: discord.Member, *, reason: str="No reason"):
        await member.ban(reason=reason, delete_message_days=0)
        await ctx.reply(f"⛔ {member} banned – {reason}")

    @commands.hybrid_command(description="Bulk delete 1‑100 messages (Manage Messages perm)")
    @commands.has_permissions(manage_messages=True)
    async def purge(self, ctx: commands.Context, amount: commands.Range[int,1,100]):
        deleted = await ctx.channel.purge(limit=amount)
        await ctx.reply(f"🧹 Deleted {len(deleted)} msg(s)", delete_after=5)

    # -------- Hot‑reload for dev convenience --------
    @commands.hybrid_command(description="Reload a cog file (bot owner only)")
    @commands.is_owner()
    async def reload(self, ctx: commands.Context, cog: str):
        try:
            await self.bot.reload_extension(f"cogs.{cog}")
            await ctx.reply(f"♻️ Reloaded cogs.{cog}")
        except Exception as exc:
            await ctx.reply(f"❌ Reload failed: {exc}")

async def setup(bot: commands.Bot):
    await bot.add_cog(Admin(bot))
