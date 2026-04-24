interface ApiSectionNoticeProps {
  errorMessage?: string | null;
  mode: "cache" | "error";
  onRetry: () => void;
  sectionName: string;
}

export const ApiSectionNotice = ({
  errorMessage,
  mode,
  onRetry,
  sectionName,
}: ApiSectionNoticeProps) => (
  <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/8 px-4 py-3 text-sm text-amber-100">
    <p className="font-medium text-amber-50">
      {mode === "cache"
        ? `Showing the last saved ${sectionName} while the API recovers.`
        : `The ${sectionName} API is unavailable right now.`}
    </p>
    <p className="mt-1 text-amber-100/80">
      {errorMessage ?? "A temporary server issue prevented fresh data from loading."}
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="mt-3 rounded-md border border-amber-200/20 px-3 py-1.5 font-mono text-xs uppercase tracking-[0.18em] text-amber-50 transition-colors duration-200 hover:border-amber-200/40 hover:bg-amber-100/10"
    >
      Retry request
    </button>
  </div>
);
