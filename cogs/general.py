import discord
from discord.ext import commands

class General(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # Hybrid = both prefix & slash automatically
    @commands.hybrid_command(description="Check bot latency (ms)")
    async def ping(self, ctx: commands.Context):
        await ctx.reply(f"Pong! {round(self.bot.latency*1000)} ms")

    @commands.hybrid_command(description="Get avatar – yours or another member's")
    async def avatar(self, ctx: commands.Context, member: discord.Member | None = None):
        member = member or ctx.author
        await ctx.reply(member.display_avatar.url)

    @commands.hybrid_command(description="Quick server stats")
    async def serverinfo(self, ctx: commands.Context):
        g = ctx.guild
        e = discord.Embed(title=g.name, description=f"Created {g.created_at:%Y‑%m‑%d}")
        e.add_field(name="Members", value=g.member_count)
        e.add_field(name="Text Channels", value=len(g.text_channels))
        e.add_field(name="Voice Channels", value=len(g.voice_channels))
        if g.icon:
            e.set_thumbnail(url=g.icon.url)
        await ctx.reply(embed=e)

async def setup(bot: commands.Bot):
    await bot.add_cog(General(bot))
