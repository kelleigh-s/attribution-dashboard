export default function JourneyPage() {
  // Mock conversion paths for the sample visualization
  const samplePaths = [
    {
      steps: [
        { label: 'Organic Search', type: 'organic' },
        { label: 'Email', type: 'email' },
        { label: 'Google Ads', type: 'paid' },
      ],
      conversionRate: '12%',
      count: 342,
    },
    {
      steps: [
        { label: 'Direct', type: 'direct' },
        { label: 'Meta', type: 'paid' },
      ],
      conversionRate: '8%',
      count: 218,
    },
    {
      steps: [{ label: 'Organic Search', type: 'organic' }],
      conversionRate: '24%',
      count: 963,
    },
    {
      steps: [
        { label: 'Meta', type: 'paid' },
        { label: 'Organic Search', type: 'organic' },
        { label: 'Direct', type: 'direct' },
      ],
      conversionRate: '6%',
      count: 164,
    },
    {
      steps: [
        { label: 'Google Ads', type: 'paid' },
        { label: 'Direct', type: 'direct' },
      ],
      conversionRate: '9%',
      count: 247,
    },
  ];

  const chipColors: Record<string, { bg: string; text: string; border: string }> = {
    paid: { bg: '#006373', text: '#ffffff', border: '#006373' },
    organic: { bg: '#F8B457', text: '#434C53', border: '#F8B457' },
    email: { bg: '#C3E3F2', text: '#006373', border: '#C3E3F2' },
    direct: { bg: '#E5E7EB', text: '#434C53', border: '#D1D5DB' },
  };

  // BigQuery setup steps
  const setupSteps = [
    { label: 'Google Cloud project created', status: 'done' as const },
    { label: 'BigQuery API enabled', status: 'done' as const },
    { label: 'GA4 to BigQuery link', status: 'progress' as const },
    { label: 'Data collection (starts after link)', status: 'pending' as const },
    { label: '2 weeks of data needed for meaningful paths', status: 'pending' as const },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* ----------------------------------------------------------------- */}
      {/* Page Header                                                        */}
      {/* ----------------------------------------------------------------- */}
      <header>
        <h1 className="text-3xl font-bold text-[#434C53] tracking-tight">
          The Path to Purchase
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Customer journey analysis
        </p>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Status Card                                                        */}
      {/* ----------------------------------------------------------------- */}
      <section className="flex justify-center">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 max-w-2xl w-full text-center">
          {/* Status icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-[#F8B457]/20 flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-[#F8B457]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-semibold text-[#434C53] mb-2">
            Customer Journey Data Is Being Collected
          </h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-lg mx-auto">
            This page will populate once BigQuery is connected and has accumulated enough data
            to show meaningful customer journey patterns. Here is what will be available:
          </p>

          <div className="text-left bg-gray-50 rounded-lg p-5 max-w-md mx-auto">
            <ul className="space-y-3 text-sm text-[#434C53]">
              <li className="flex items-start gap-2">
                <span className="text-[#006373] mt-0.5 flex-shrink-0">&#8226;</span>
                <span><span className="font-medium">Top 20 conversion paths</span> to first purchase</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006373] mt-0.5 flex-shrink-0">&#8226;</span>
                <span><span className="font-medium">Path length distribution</span> — how many touchpoints before buying</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006373] mt-0.5 flex-shrink-0">&#8226;</span>
                <span><span className="font-medium">Channel role matrix</span> — which channels introduce vs. close</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006373] mt-0.5 flex-shrink-0">&#8226;</span>
                <span><span className="font-medium">Top assisting channels</span> — channels that help but rarely get last-click credit</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#006373] mt-0.5 flex-shrink-0">&#8226;</span>
                <span><span className="font-medium">Session-level vs. customer-level analysis</span> — single visit vs. full journey view</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Sample Visualization                                               */}
      {/* ----------------------------------------------------------------- */}
      <section>
        <h2 className="text-xl font-semibold text-[#434C53] mb-2">
          Sample: What Conversion Paths Will Look Like
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Each row represents a common path customers take before their first purchase. The chips
          show the sequence of channels they interact with.
        </p>

        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 space-y-4">
          {samplePaths.map((path, index) => (
            <div
              key={index}
              className="flex items-center gap-3 flex-wrap"
            >
              {/* Path number */}
              <span className="text-xs text-gray-400 font-mono w-6 flex-shrink-0">
                #{index + 1}
              </span>

              {/* Channel chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {path.steps.map((step, stepIndex) => {
                  const colors = chipColors[step.type] || chipColors.direct;
                  return (
                    <div key={stepIndex} className="flex items-center gap-1.5">
                      <span
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}
                      >
                        {step.label}
                      </span>
                      {stepIndex < path.steps.length - 1 && (
                        <svg
                          className="w-4 h-4 text-gray-300 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })}

                {/* Purchase chip */}
                <svg
                  className="w-4 h-4 text-gray-300 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-[#639922]/15 text-[#639922] border border-[#639922]/30">
                  Purchase
                </span>
              </div>

              {/* Count */}
              <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                {path.count.toLocaleString()} customers
              </span>
            </div>
          ))}

          {/* Legend */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4">
            {Object.entries(chipColors).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                />
                {type === 'paid'
                  ? 'Paid channels'
                  : type === 'organic'
                  ? 'Organic channels'
                  : type === 'email'
                  ? 'Email'
                  : 'Direct'}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 italic mt-2">
            This is sample data for illustration purposes. Actual paths will appear once BigQuery
            data collection is complete.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- */}
      {/* Setup Status                                                       */}
      {/* ----------------------------------------------------------------- */}
      <section className="pb-8">
        <h2 className="text-xl font-semibold text-[#434C53] mb-4">
          BigQuery Setup Status
        </h2>
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-6 max-w-lg">
          <div className="space-y-3">
            {setupSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {/* Status icon */}
                {step.status === 'done' && (
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-[#639922]/15 text-[#639922] flex-shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                {step.status === 'progress' && (
                  <span className="w-5 h-5 rounded flex items-center justify-center bg-[#F8B457]/20 text-[#F8B457] flex-shrink-0">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </span>
                )}
                {step.status === 'pending' && (
                  <span className="w-5 h-5 rounded border-2 border-gray-200 flex-shrink-0" />
                )}

                {/* Label */}
                <span
                  className={`text-sm ${
                    step.status === 'done'
                      ? 'text-[#434C53]'
                      : step.status === 'progress'
                      ? 'text-[#434C53] font-medium'
                      : 'text-gray-400'
                  }`}
                >
                  {step.label}
                  {step.status === 'progress' && (
                    <span className="ml-2 text-[10px] text-[#F8B457] font-semibold">
                      IN PROGRESS
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-gray-500 bg-gray-50 rounded-md p-3 leading-relaxed">
            <span className="font-semibold text-[#434C53]">What this means:</span>{' '}
            Once the GA4 to BigQuery link is established, raw event data will begin flowing into
            BigQuery automatically. After approximately 2 weeks of data collection, the journey
            analysis will have enough information to show reliable patterns.
          </p>
        </div>
      </section>
    </div>
  );
}
