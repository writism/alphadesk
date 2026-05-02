'use client'

import { useInvestmentProfile } from '@/features/my/application/hooks/useInvestmentProfile'

const INVESTMENT_STYLES = ['단기', '중장기', '장기']
const RISK_LEVELS = ['낮음', '중간', '높음']
const ANALYSIS_PREFS = ['뉴스중심', '공시중심', '혼합']
const SECTOR_OPTIONS = ['IT', '반도체', '바이오', '2차전지', '금융', '통신', '유틸리티', '소비재', '방산', '플랫폼']

function ToggleGroup({
    label,
    options,
    value,
    onChange,
}: {
    label: string
    options: string[]
    value: string
    onChange: (v: string) => void
}) {
    return (
        <div>
            <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {label}
            </div>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(value === opt ? '' : opt)}
                        className={`font-mono text-xs px-3 py-1.5 border uppercase transition-none ${
                            value === opt
                                ? 'border-primary bg-primary text-white font-bold'
                                : 'border-outline text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}

function MultiToggleGroup({
    label,
    options,
    values,
    onChange,
}: {
    label: string
    options: string[]
    values: string[]
    onChange: (v: string[]) => void
}) {
    const toggle = (opt: string) => {
        onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt])
    }
    return (
        <div>
            <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                {label}
            </div>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggle(opt)}
                        className={`font-mono text-xs px-3 py-1.5 border uppercase transition-none ${
                            values.includes(opt)
                                ? 'border-primary bg-primary text-white font-bold'
                                : 'border-outline text-on-surface-variant hover:bg-surface-container'
                        }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )
}

export function MyInvestmentProfileSection() {
    const { profile, saving, saveMessage, save } = useInvestmentProfile()

    const update = (patch: Partial<typeof profile>) => {
        save({ ...profile, ...patch })
    }

    return (
        <section className="border border-outline bg-surface-container-low px-5 py-4 space-y-6">
            <div className="font-mono text-xs font-bold text-on-surface uppercase tracking-widest">
                AI_ANALYSIS_PROFILE
            </div>
            <div className="font-mono text-xs text-on-surface-variant">
                AI 분석 시 사용자 성향을 반영합니다. 투자 추천 용도가 아닙니다.
            </div>

            <ToggleGroup
                label="INVESTMENT_STYLE"
                options={INVESTMENT_STYLES}
                value={profile.investment_style}
                onChange={(v) => update({ investment_style: v })}
            />

            <ToggleGroup
                label="RISK_TOLERANCE"
                options={RISK_LEVELS}
                value={profile.risk_tolerance}
                onChange={(v) => update({ risk_tolerance: v })}
            />

            <MultiToggleGroup
                label="PREFERRED_SECTORS"
                options={SECTOR_OPTIONS}
                values={profile.preferred_sectors}
                onChange={(v) => update({ preferred_sectors: v })}
            />

            <ToggleGroup
                label="ANALYSIS_PREFERENCE"
                options={ANALYSIS_PREFS}
                value={profile.analysis_preference}
                onChange={(v) => update({ analysis_preference: v })}
            />

            <div>
                <div className="font-mono text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                    KEYWORDS
                </div>
                <div className="font-mono text-xs text-outline mb-2">쉼표로 구분 (예: AI반도체, 전고체배터리)</div>
                <input
                    type="text"
                    value={profile.keywords_of_interest.join(', ')}
                    onChange={(e) => {
                        const keywords = e.target.value
                            .split(',')
                            .map((k) => k.trim())
                            .filter(Boolean)
                        update({ keywords_of_interest: keywords })
                    }}
                    placeholder="관심 키워드 입력"
                    className="w-full bg-surface-container-lowest border border-outline px-3 py-1.5 font-mono text-sm text-on-surface outline-none focus:border-primary"
                />
            </div>

            {saveMessage && (
                <p className="font-mono text-xs text-tertiary">{saveMessage}</p>
            )}
            {saving && (
                <p className="font-mono text-xs text-on-surface-variant">저장 중...</p>
            )}
        </section>
    )
}
