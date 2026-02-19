
import * as React from "react"
import { cn } from "@/lib/utils"

type AvatarConfig = {
    status: "loading" | "loaded" | "error"
    setStatus: (status: "loading" | "loaded" | "error") => void
}

const AvatarContext = React.createContext<AvatarConfig | null>(null)

const Avatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading")

    return (
        <AvatarContext.Provider value={{ status, setStatus }}>
            <div
                ref={ref}
                className={cn(
                    "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
                    className
                )}
                {...props}
            />
        </AvatarContext.Provider>
    )
})
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, onLoad, onError, ...props }, ref) => {
    const context = React.useContext(AvatarContext)
    if (!context) throw new Error("AvatarImage must be used within Avatar")
    const { setStatus, status } = context

    React.useLayoutEffect(() => {
        if (!src) {
            setStatus("error")
            return
        }
        const img = new Image()
        img.src = src
        img.onload = () => setStatus("loaded")
        img.onerror = () => setStatus("error")
    }, [src, setStatus])

    if (status === "error") return null

    return (
        <img
            ref={ref}
            src={src}
            className={cn("aspect-square h-full w-full object-cover", status === "loading" && "opacity-0", className)}
            {...props}
        />
    )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const context = React.useContext(AvatarContext)
    if (!context) throw new Error("AvatarFallback must be used within Avatar")

    if (context.status === "loaded") return null

    return (
        <div
            ref={ref}
            className={cn(
                "flex h-full w-full items-center justify-center rounded-full bg-muted",
                className
            )}
            {...props}
        />
    )
})
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
