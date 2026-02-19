
import { TeamMember } from "@/features/projects/services/teamService";
import { MemberCard } from "./MemberCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamMembersListProps {
    members: TeamMember[];
    variant?: "compact" | "full";
    className?: string;
}

export function TeamMembersList({ members, variant = "full", className }: TeamMembersListProps) {
    if (variant === "compact") {
        // Horizontal avatar row
        const maxAvatars = 4;
        const displayMembers = members.slice(0, maxAvatars);
        const remaining = members.length - maxAvatars;

        return (
            <div className={cn("flex items-center -space-x-2 p-1", className)}>
                {displayMembers.map((member) => (
                    <div key={member.id} className="relative group/avatar" title={`${member.username} - ${member.skills.join(', ')}`}>
                        <Avatar className="h-8 w-8 border-2 border-background ring-2 ring-transparent transition-all duration-200 hover:scale-110 hover:z-20 hover:ring-primary/20 hover:border-primary/20">
                            <AvatarImage src={member.avatar || ""} />
                            <AvatarFallback className="text-[10px] sm:text-xs">{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                    </div>
                ))}
                {remaining > 0 && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground hover:bg-muted/80 hover:z-10 cursor-default" title="And more...">
                        +{remaining}
                    </div>
                )}
            </div>
        );
    }

    // Full grid layout
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
            {members.map(member => (
                <MemberCard key={member.id} member={member} />
            ))}
            {members.length === 0 && (
                <div className="col-span-full py-8 text-center text-muted-foreground">
                    No members found.
                </div>
            )}
        </div>
    )
}
