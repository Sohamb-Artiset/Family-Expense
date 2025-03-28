
import { BackgroundPaths } from "@/components/ui/background-paths";

export function BackgroundPathsDemo() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center relative">
            <BackgroundPaths title="Background Paths" showButton={true} />
            <div className="relative z-10 text-center">
                <h2 className="text-2xl font-bold">Background Paths Demo</h2>
                <p className="text-muted-foreground">You should see animated paths behind this text</p>
            </div>
        </div>
    );
}
