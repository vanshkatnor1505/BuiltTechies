function getSafeSourceUrl(value) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function ResearchSources({ sources, emptyMessage = "No sources available yet." }) {
  const sourceLinks = Array.isArray(sources)
    ? sources
        .map((source) => ({
          title: typeof source?.title === "string" && source.title.trim()
            ? source.title.trim()
            : "Research source",
          url: getSafeSourceUrl(source?.url),
        }))
        .filter((source) => source.url)
    : [];

  if (!sourceLinks.length) {
    return <p className="research-source-empty">{emptyMessage}</p>;
  }

  return (
    <ul className="research-source-list" onClick={(event) => event.stopPropagation()}>
      {sourceLinks.map((source, index) => (
        <li key={`${source.url}-${index}`}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.title}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default ResearchSources;
