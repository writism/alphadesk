"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAtom } from "jotai"
import { useTerms } from "@/features/terms/application/hooks/useTerms"
import { termsConsentAtom } from "@/features/terms/application/atoms/termsConsentAtom"

export default function TermsPage() {
    return (
        <Suspense>
            <TermsContent />
        </Suspense>
    )
}

function TermsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { terms } = useTerms()
    const [, setTermsConsent] = useAtom(termsConsentAtom)
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
    const [expandedTermId, setExpandedTermId] = useState<string | null>(null)

    const allChecked = terms.length > 0 && terms.every(item => checkedItems[item.id])
    const allRequiredChecked = terms
        .filter(item => item.required)
        .every(item => checkedItems[item.id])

    const handleAllCheck = (checked: boolean) => {
        const newState: Record<string, boolean> = {}
        terms.forEach(item => { newState[item.id] = checked })
        setCheckedItems(newState)
    }

    const handleCheck = (id: string, checked: boolean) => {
        setCheckedItems(prev => ({ ...prev, [id]: checked }))
    }

    const handleToggleDetails = (id: string) => {
        setExpandedTermId(prev => prev === id ? null : id)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!allRequiredChecked) return
        const agreedIds = terms.filter(item => checkedItems[item.id]).map(item => item.id)
        setTermsConsent(agreedIds)
        const params = searchParams.toString()
        router.push(`/account/signup${params ? `?${params}` : ""}`)
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4 py-10">
            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-2xl flex-col gap-4 rounded-lg border p-8 shadow-sm"
            >
                <h1 className="text-2xl font-bold">서비스 이용약관</h1>
                <p className="text-sm text-gray-500">서비스 이용을 위해 아래 약관에 동의해 주세요.</p>

                <div className="flex items-center gap-3 py-3 border-b-2">
                    <input
                        type="checkbox"
                        id="agree_all"
                        checked={allChecked}
                        onChange={(e) => handleAllCheck(e.target.checked)}
                        className="w-4 h-4 flex-shrink-0"
                    />
                    <label htmlFor="agree_all" className="text-sm font-semibold cursor-pointer">
                        전체 동의
                    </label>
                </div>

                <div className="flex flex-col gap-1">
                    {terms.map(item => (
                        <div key={item.id} className="border-b last:border-b-0">
                            <div className="flex items-center gap-3 py-3">
                                <input
                                    type="checkbox"
                                    id={item.id}
                                    checked={checkedItems[item.id] ?? false}
                                    onChange={(e) => handleCheck(item.id, e.target.checked)}
                                    className="w-4 h-4 flex-shrink-0"
                                />
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                                    item.required
                                        ? "bg-red-100 text-red-600"
                                        : "bg-gray-100 text-gray-500"
                                }`}>
                                    {item.required ? "필수" : "선택"}
                                </span>
                                <label htmlFor={item.id} className="text-sm flex-1 cursor-pointer">
                                    {item.title}
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleToggleDetails(item.id)}
                                    aria-expanded={expandedTermId === item.id}
                                    className="text-xs text-gray-400 hover:text-gray-600 flex-shrink-0"
                                >
                                    {expandedTermId === item.id ? "닫기" : "보기"}
                                </button>
                            </div>

                            {expandedTermId === item.id && (
                                <div className="mb-3 rounded-md bg-gray-50 px-4 py-4 text-sm leading-6 text-gray-700">
                                    <h2 className="mb-3 font-semibold text-gray-900">{item.title}</h2>
                                    <div className="flex flex-col gap-4">
                                        {item.sections.map((section) => (
                                            <section key={section.title} className="flex flex-col gap-2">
                                                <h3 className="font-medium text-gray-900">{section.title}</h3>
                                                <ul className="list-disc pl-5">
                                                    {section.content.map((content) => (
                                                        <li key={content}>{content}</li>
                                                    ))}
                                                </ul>
                                            </section>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="submit"
                    disabled={!allRequiredChecked}
                    className="bg-[#FEE500] text-[#3C1E1E] font-bold py-3 rounded-lg hover:bg-[#E6CF00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    동의하고 계속하기
                </button>
            </form>
        </div>
    )
}
