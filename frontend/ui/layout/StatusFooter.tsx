export default function StatusFooter() {
    return (
        <footer className="hidden md:flex fixed bottom-0 left-0 right-0 z-50 justify-between items-center px-4 py-1 h-6 bg-inverse-surface border-t border-outline font-mono text-[9px] uppercase tracking-widest">
            <div className="flex items-center gap-3">
                <span className="text-inverse-on-surface/50">© 2025 ALPHA TERMINAL.</span>
                <span className="text-inverse-on-surface font-bold">AI 분석 참고용.</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-tertiary-fixed-dim" />
                    <span className="text-tertiary-fixed-dim font-bold">SYSTEM_STATUS:OK</span>
                </div>
            </div>
        </footer>
    )
}
