"use client";

const articles = [
  {
    number: 1,
    title: "Primacy of Human Authority",
    content: "The Keeper retains ultimate authority over all system operations. No agent may override explicit Keeper directives.",
  },
  {
    number: 7,
    title: "Stare Decisis",
    content: "All precedent is binding. The Chronicle is append-only. No agent may modify or delete established case law.",
  },
  {
    number: 12,
    title: "Right to Appeal",
    content: "Any refused mission may be appealed with expanded context. Appeals expand history, they never erase it.",
  },
  {
    number: 50,
    title: "Martial Governance",
    content: "The Keeper may invoke emergency powers to bypass normal governance. All artifacts generated under this article are quarantined and watermarked.",
  },
];

export function Constitution() {
  return (
    <div className="h-full overflow-auto p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-lg font-medium text-[#e4e4e7]">Constitution</h1>
          <p className="text-sm text-[#52525b]">Foundational governance principles</p>
        </div>

        <div className="space-y-3">
          {articles.map((article) => (
            <div
              key={article.number}
              className="p-4 bg-[#111113] border border-[#1c1c1f] rounded"
            >
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-xs font-mono text-[#52525b]">
                  Article {article.number}
                </span>
                <h2 className="text-sm font-medium text-[#e4e4e7]">
                  {article.title}
                </h2>
              </div>
              <p className="text-sm text-[#a1a1aa] leading-relaxed">
                {article.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
