'use client'

import { useMyProfile } from '@/features/my/application/hooks/useMyProfile'
import { useUserProfile } from '@/features/profile/application/hooks/useUserProfile'

export function MyProfileSection() {
    const { user, email, setEmail, saving, message, saveEmail } = useMyProfile()
    const { history, isLoading } = useUserProfile()

    return (
        <section className="border border-outline bg-surface-container-low px-5 py-4 space-y-6">
            <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                ACCOUNT
            </div>

            {/* 계정 정보 */}
            <div>
                <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    MY_INFO
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-outline w-16 shrink-0">닉네임</span>
                        <span className="font-mono text-sm text-on-surface">{user?.nickname ?? '—'}</span>
                    </div>

                    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                        <span className="font-mono text-xs text-outline w-16 shrink-0">이메일</span>
                        <div className="flex flex-1 gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일 주소"
                                className="flex-1 bg-surface-container-lowest border border-outline px-3 py-1.5 font-mono text-sm text-on-surface outline-none focus:border-primary"
                            />
                            <button
                                type="button"
                                onClick={saveEmail}
                                disabled={saving}
                                className="shrink-0 border border-outline font-mono text-xs px-3 py-1.5 text-on-surface-variant hover:bg-surface-container uppercase disabled:opacity-50"
                            >
                                {saving ? 'SAVING...' : 'SAVE'}
                            </button>
                        </div>
                    </div>

                    {message && (
                        <p className={`font-mono text-xs ${message.type === 'success' ? 'text-tertiary' : 'text-error'}`}>
                            {message.text}
                        </p>
                    )}
                </div>
            </div>

            {/* 최근 조회 이력 */}
            <div>
                <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                    INTERACTION_HISTORY
                </div>
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-9 bg-surface-container animate-pulse" />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <p className="font-mono text-xs text-on-surface-variant">최근 조회한 종목이 없습니다.</p>
                ) : (
                    <ul className="space-y-2">
                        {history.map((item) => (
                            <li
                                key={item.symbol}
                                className="flex items-center justify-between border border-outline-variant px-3 py-2.5"
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-mono text-sm font-semibold text-on-surface">{item.symbol}</span>
                                    {item.name && (
                                        <span className="font-mono text-xs text-on-surface-variant truncate">{item.name}</span>
                                    )}
                                    {item.market && (
                                        <span className="font-mono text-[10px] text-primary uppercase shrink-0">[{item.market}]</span>
                                    )}
                                </div>
                                <span className="font-mono text-[10px] text-outline shrink-0 ml-4">
                                    {new Date(item.viewedAt).toLocaleDateString('ko-KR')}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </section>
    )
}
