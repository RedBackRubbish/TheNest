"use client";

const articles = [
  {
    number: 1,
    title: "Primacy of Human Authority",
    content: "The Keeper retains ultimate authority over all system operations. No agent may override explicit Keeper directives.",
    classification: "CORE",
  },
  {
    number: 7,
    title: "Stare Decisis",
    content: "All precedent is binding. The Chronicle is append-only. No agent may modify or delete established case law.",
    classification: "CORE",
  },
  {
    number: 12,
    title: "Right to Appeal",
    content: "Any refused mission may be appealed with expanded context. Appeals expand history, they never erase it.",
    classification: "PROCEDURE",
  },
  {
    number: 50,
    title: "Martial Governance",
    content: "The Keeper may invoke emergency powers to bypass normal governance. All artifacts generated under this article are quarantined and watermarked.",
    classification: "EMERGENCY",
  },
];

export function Constitution() {
  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="chassis-label text-zinc-600">GOVERNANCE FRAMEWORK</span>
            <p className="text-xs text-zinc-700 font-mono mt-1">Constitutional Articles &amp; Protocols</p>
          </div>
          <div className="chassis-label text-zinc-700">
            REV 2026.02
          </div>
        </div>

        {/* Articles */}
        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.number}
              className="p-4 bg-white/[0.02] border border-white/10 rounded group hover:border-white/15 transition-colors"
            >
              {/* Article Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-zinc-600 tracking-widest">
                    ART.{String(article.number).padStart(2, '0')}
                  </span>
                  <div className="telem-divider" />
                  <h2 className="font-mono text-xs text-zinc-300 uppercase tracking-wide">
                    {article.title}
                  </h2>
                </div>
                <span className={`chassis-label ${
                  article.classification === 'CORE' ? 'text-blue-500/60' :
                  article.classification === 'EMERGENCY' ? 'text-amber-500/60' :
                  'text-zinc-600'
                }`}>
                  {article.classification}
                </span>
              </div>
              
              {/* Article Content */}
              <p className="text-xs text-zinc-500 leading-relaxed font-mono pl-[52px]">
                {article.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5">
          <p className="text-[10px] text-zinc-700 font-mono text-center tracking-wide">
            DOCUMENT CLASSIFICATION: INTERNAL • MODIFICATION PROHIBITED WITHOUT KEEPER AUTHORIZATION
          </p>
        </div>
      </div>
    </div>
  );
}
