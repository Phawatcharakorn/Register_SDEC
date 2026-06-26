'use client'

export interface Step {
  id: number
  title: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number  // 1-based
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, index) => {
          const done    = step.id < currentStep
          const active  = step.id === currentStep
          const pending = step.id > currentStep

          return (
            <div key={step.id} className="flex flex-1 items-center">
              {/* Circle + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <div
                  className={`
                    flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                    text-sm font-bold transition-all duration-300
                    ${done    ? 'bg-green-500 text-white shadow-sm'                  : ''}
                    ${active  ? 'bg-ku-green text-white shadow-md ring-4 ring-ku-green-50' : ''}
                    ${pending ? 'bg-gray-100 text-gray-400 border-2 border-gray-200' : ''}
                  `}
                >
                  {done ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`
                    text-center text-xs leading-tight transition-colors max-w-[80px]
                    ${active  ? 'font-bold text-ku-green'  : ''}
                    ${done    ? 'font-medium text-green-600' : ''}
                    ${pending ? 'text-gray-400'             : ''}
                  `}
                >
                  {step.title}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-2 mb-5 h-[2px] flex-1 rounded-full transition-all duration-500"
                  style={{ background: done ? '#22C55E' : '#E5E7EB' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile — progress bar + current step label */}
      <div className="flex flex-col gap-2 sm:hidden">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-ku-green">
            ขั้นตอนที่ {currentStep} · {steps[currentStep - 1]?.title}
          </span>
          <span className="text-gray-400">{currentStep} / {steps.length}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-ku-green transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  )
}
