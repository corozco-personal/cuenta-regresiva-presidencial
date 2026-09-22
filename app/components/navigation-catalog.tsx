"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { navigationGroups } from "../data/navigation";

export default function NavigationCatalog({ onNavigate }: { onNavigate?: () => void }) {
  const [expandedGroup, setExpandedGroup] = useState<number | null>(0);

  return <div className="nav-more-panel">
    {navigationGroups.map((group, index) => <section className={`nav-group${expandedGroup === index ? " open" : ""}`} key={group.title}>
      <header><button className="nav-group-toggle" type="button" aria-expanded={expandedGroup === index} onClick={() => setExpandedGroup(current => current === index ? null : index)}><span><strong>{group.title}</strong><small>{group.description}</small></span><ChevronDown size={16} /></button></header>
      <div className="nav-group-items">{group.items.map(item => <a className={"className" in item ? item.className : undefined} href={item.href} key={item.href} onClick={onNavigate}>{item.label}</a>)}</div>
    </section>)}
  </div>;
}
