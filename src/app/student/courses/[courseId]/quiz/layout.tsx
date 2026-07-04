// This layout intentionally bypasses the student sidebar/header
// to provide the distraction-free quiz experience shown in the design.
export default function QuizLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
