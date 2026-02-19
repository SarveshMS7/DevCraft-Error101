
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SkillBadge } from "@/components/shared/SkillBadge";
import { TeamMember } from "@/features/projects/services/teamService";
import { cn } from "@/lib/utils";

interface MemberCardProps {
    member: TeamMember;
    className?: string;
}

export function MemberCard({ member, className }: MemberCardProps) {
    const initials = member.username?.substring(0, 2).toUpperCase() || "??";
    const displayedSkills = member.skills.slice(0, 5);
    const remainingSkills = member.skills.length - 5;

    return (
        <div className={cn("group relative flex flex-col space-y-4 rounded-xl border p-4 shadow-sm transition-all hover:shadow-md bg-card", className)}>
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border">
                    <AvatarImage src={member.avatar || ""} alt={member.username} />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold leading-none truncate" title={member.username}>{member.username}</h4>
                        {member.role && (
                            <span className="shrink-0 max-w-[50%] truncate inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground" title={member.role}>
                                {member.role}
                            </span>
                        )}
                    </div>
                    {/* Add more info maybe? */}
                </div>
            </div>

            <div className="space-y-2">
                {member.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {displayedSkills.map(skill => (
                            <SkillBadge key={skill} skill={skill} size="sm" variant="outline" className="text-[10px] h-5" />
                        ))}
                        {remainingSkills > 0 && (
                            <span className="text-[10px] text-muted-foreground self-center px-1">
                                +{remainingSkills} more
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground italic">No skills listed</p>
                )}
            </div>
        </div>
    )
}
