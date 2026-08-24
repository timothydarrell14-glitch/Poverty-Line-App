const cards = [
  { kind: 'help-card', icon: 'handshake', title: 'Get Help', text: 'Access streamlined resources for daily necessities, educational support, and community assistance programs designed for immediate impact and long-term stability.', action: 'Learn More', tab: 'get-help' },
  { kind: 'donor-card', icon: 'favorite', title: 'Donors', text: 'See exactly how your contributions build sustainable futures. We prioritize transparency, ensuring every resource is efficiently allocated to maximize community benefit.', action: 'Support Now', tab: 'donors' },
  { kind: 'org-card', icon: 'domain', title: 'Organisations', text: 'Join our network of institutional partners. By aligning our operational capacities, we can scale proven solutions and deliver comprehensive support across regions.', action: 'Partner With Us', tab: 'organisations' },
];
export const EcosystemSection = ({ onSelectTab }) => (
  <section className="ecosystem-section" id="focus-areas"><div className="content-wrap">
    <div className="section-heading"><h2 className="font-heading">Our Collaborative Ecosystem</h2><p>A unified platform connecting individuals in need, dedicated donors, and partner organizations to create lasting change.</p></div>
    <div className="ecosystem-grid">{cards.map(({ kind, icon, title, text, action, tab }) => <article className={`ecosystem-card ${kind}`} key={title}>
      <div className="card-icon"><span className="material-symbols-outlined">{icon}</span></div><h3 className="font-heading">{title}</h3><p>{text}</p>
      {tab === 'get-help' ? <button className="card-link" onClick={() => onSelectTab(tab)}>{action}<span className="material-symbols-outlined">arrow_forward</span></button> : <button className="card-action" onClick={() => onSelectTab(tab)}>{action}{tab === 'donors' && <span className="material-symbols-outlined">arrow_forward</span>}</button>}
    </article>)}</div>
  </div></section>
);
export default EcosystemSection;