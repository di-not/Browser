document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector("main.container");
  if (!main || main.dataset.tocReady === "true") {
    return;
  }

  const headings = Array.from(main.querySelectorAll("h2, h3")).filter(
    (heading) => heading.textContent && heading.textContent.trim().length > 0
  );

  if (headings.length === 0) {
    return;
  }

  const slugCounts = new Map();
  const makeSlug = (text) => {
    const base = text
      .toLowerCase()
      .replace(/[`"'!?.,:;()[\]{}]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    const safeBase = base || "section";
    const count = slugCounts.get(safeBase) || 0;
    slugCounts.set(safeBase, count + 1);
    return count === 0 ? safeBase : `${safeBase}-${count + 1}`;
  };

  for (const heading of headings) {
    if (!heading.id) {
      heading.id = makeSlug(heading.textContent.trim());
    }
  }

  const articleContent = document.createElement("div");
  articleContent.className = "article-content";
  while (main.firstChild) {
    articleContent.appendChild(main.firstChild);
  }

  const tocAside = document.createElement("aside");
  tocAside.className = "article-toc";
  tocAside.setAttribute("aria-label", "Навигация по статье");

  const tocTitle = document.createElement("p");
  tocTitle.className = "article-toc-title";
  tocTitle.textContent = "Навигация";
  tocAside.appendChild(tocTitle);

  const tocList = document.createElement("ul");
  tocList.className = "article-toc-list";

  for (const heading of headings) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.className = `article-toc-link depth-${heading.tagName.toLowerCase() === "h3" ? "3" : "2"}`;
    link.href = `#${heading.id}`;
    link.textContent = heading.textContent.trim();
    item.appendChild(link);
    tocList.appendChild(item);
  }

  tocAside.appendChild(tocList);

  const layout = document.createElement("div");
  layout.className = "article-layout";
  layout.appendChild(articleContent);
  layout.appendChild(tocAside);

  main.appendChild(layout);
  main.dataset.tocReady = "true";
  document.body.classList.add("has-toc");

  const links = Array.from(tocList.querySelectorAll(".article-toc-link"));
  const linkById = new Map(links.map((link) => [decodeURIComponent(link.hash.slice(1)), link]));

  const setActive = (id) => {
    for (const link of links) {
      link.classList.toggle("is-active", decodeURIComponent(link.hash.slice(1)) === id);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: "-20% 0px -65% 0px",
      threshold: 0.1,
    }
  );

  for (const heading of headings) {
    observer.observe(heading);
  }

  if (headings[0]) {
    setActive(headings[0].id);
  }
});
