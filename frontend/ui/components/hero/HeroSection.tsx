import { heroStyles } from "@/ui/layout/hero.styles"

const stats = [
    { value: "2,400+", label: "일일 공시 건수" },
    { value: "99.9%", label: "데이터 정확도" },
    { value: "0.3초", label: "평균 분석 속도" },
    { value: "15만+", label: "분석 종목 수" },
]

export default function HeroSection() {
    return (
        <section className={heroStyles.section}>
            <div className={heroStyles.background} aria-hidden="true" />
            <div className={heroStyles.orb1} aria-hidden="true" />
            <div className={heroStyles.orb2} aria-hidden="true" />
            <div className={heroStyles.container}>
                <span className={heroStyles.badge}>
                    <span className={heroStyles.badgeDot} />
                    주식 공시 분석 서비스
                </span>
                <h1 className={heroStyles.heading}>
                    투자 인사이트를
                    <br />
                    <span className={heroStyles.headingAccent}>한눈에 파악하세요</span>
                </h1>
                <div className={heroStyles.divider} />
                <p className={heroStyles.subheading}>
                    실시간 공시 데이터와 관심 종목을 분석하여
                    <br className="hidden sm:block" />
                    더 나은 투자 결정을 내리세요.
                </p>
                <div className={heroStyles.stats}>
                    {stats.map((stat) => (
                        <div key={stat.label} className={heroStyles.statCard}>
                            <span className={`${heroStyles.statValue} ${heroStyles.statValueAccent}`}>
                                {stat.value}
                            </span>
                            <span className={heroStyles.statLabel}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
