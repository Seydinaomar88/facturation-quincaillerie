interface CompanyHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function CompanyHeader({ title = "GESTION", subtitle }: CompanyHeaderProps) {
  return (
    <div className="bg-blue-600 rounded-2xl shadow-lg overflow-hidden mb-6">
      <div className="px-6 py-6">
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="bg-white/20 p-3 rounded-full">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white">Quincaillerie Le Saloum</h2>
          <p className="text-white/90 text-sm mt-2">
            Sope Naby Cisse et Frere
          </p>
          <p className="text-white/80 text-sm">
            Cite Biagui, route de Virage
          </p>
          <div className="flex justify-center gap-4 mt-2 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              77 894 07 77 / 77 643 58 15
            </span>
          </div>
        </div>
        <div className="text-center mt-4">
          <div className="inline-block bg-white/20 px-6 py-1 rounded-full">
            <span className="text-white font-semibold">{title}</span>
            {subtitle && (
              <span className="text-white/80 text-sm ml-2">{subtitle}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}