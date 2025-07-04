import discord, asyncio
from discord.ext import commands
from datetime import timedelta

class Manage(commands.Cog):
    """High‑privilege management commands.  Requires appropriate Discord perms."""
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    # ---------------- Channel Group ----------------
    @commands.group(invoke_without_command=True)
    @commands.has_permissions(manage_channels=True)
    async def channel(self, ctx: commands.Context):
        """`!channel` overview"""
        await ctx.send_help(ctx.command)

    @channel.command(name="create")
    async def channel_create(self, ctx: commands.Context, name: str, type: str="text", *, category: discord.CategoryChannel|None=None):
        guild = ctx.guild
        look = type.lower()
        if look.startswith("voice"):
            ch = await guild.create_voice_channel(name, category=category)
        elif look.startswith("cat"):
            ch = await guild.create_category(name)
        else:
            ch = await guild.create_text_channel(name, category=category)
        await ctx.reply(f"📁 Created {ch.mention}")

    @channel.command(name="delete")
    async def channel_delete(self, ctx: commands.Context, channel: discord.abc.GuildChannel):
        await channel.delete()
        await ctx.reply("🗑️ Channel deleted")

    @channel.command(name="lock")
    async def channel_lock(self, ctx: commands.Context, channel: discord.TextChannel|None=None):
        channel = channel or ctx.channel
        await channel.set_permissions(ctx.guild.default_role, send_messages=False)
        await ctx.reply(f"🔒 Locked {channel.mention}")

    @channel.command(name="unlock")
    async def channel_unlock(self, ctx: commands.Context, channel: discord.TextChannel|None=None):
        channel = channel or ctx.channel
        await channel.set_permissions(ctx.guild.default_role, send_messages=True)
        await ctx.reply(f"🔓 Unlocked {channel.mention}")

    @channel.command(name="slowmode")
    async def channel_slowmode(self, ctx: commands.Context, seconds: commands.Range[int,0,21600], channel: discord.TextChannel|None=None):
        channel = channel or ctx.channel
        await channel.edit(slowmode_delay=seconds)
        await ctx.reply(f"⏱️ Set slowmode {seconds}s for {channel.mention}")

    # ---------------- Role Group ----------------
    @commands.group(invoke_without_command=True)
    @commands.has_permissions(manage_roles=True)
    async def role(self, ctx: commands.Context):
        await ctx.send_help(ctx.command)

    @role.command(name="create")
    async def role_create(self, ctx: commands.Context, *, name: str):
        role = await ctx.guild.create_role(name=name)
        await ctx.reply(f"🎨 Created role {role.mention}")

    @role.command(name="delete")
    async def role_delete(self, ctx: commands.Context, role: discord.Role):
        await role.delete()
        await ctx.reply("🗑️ Role deleted")

    @role.command(name="give")
    async def role_give(self, ctx: commands.Context, role: discord.Role, member: discord.Member):
        await member.add_roles(role)
        await ctx.reply(f"➕ Gave {role.mention} to {member.mention}")

    @role.command(name="remove")
    async def role_remove(self, ctx: commands.Context, role: discord.Role, member: discord.Member):
        await member.remove_roles(role)
        await ctx.reply(f"➖ Removed {role.mention} from {member.mention}")

    # ---------------- Member controls ----------------
    @commands.hybrid_command(description="Mute (timeout) a member for N minutes")
    @commands.has_permissions(moderate_members=True)
    async def mute(self, ctx: commands.Context, member: discord.Member, minutes: commands.Range[int,1,10080]):
        until = discord.utils.utcnow() + timedelta(minutes=minutes)
        await member.timeout(until, reason=f"Muted by {ctx.author} for {minutes}m")
        await ctx.reply(f"🔇 Muted {member.mention} for {minutes} minutes")

    @commands.hybrid_command(description="Unmute a member (remove timeout)")
    @commands.has_permissions(moderate_members=True)
    async def unmute(self, ctx: commands.Context, member: discord.Member):
        await member.timeout(None)
        await ctx.reply(f"🔊 Unmuted {member.mention}")

    # ---------------- Announcement ----------------
    @commands.hybrid_command(description="Send an announcement embed to a channel")
    @commands.has_permissions(manage_messages=True)
    async def announce(self, ctx: commands.Context, channel: discord.TextChannel, *, message: str):
        embed = discord.Embed(description=message, color=0x2ECC71)
        embed.set_author(name=f"Announcement from {ctx.author}")
        await channel.send(embed=embed)
        await ctx.reply("📣 Announcement sent", ephemeral=True)

async def setup(bot: commands.Bot):
    await bot.add_cog(Manage(bot))

# ------------------------ End Of Files ------------------------
