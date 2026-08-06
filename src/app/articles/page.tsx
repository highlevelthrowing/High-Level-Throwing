import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Articles",
};

const ARTICLES = [
  {
    title: "High Level Throwing® x SuperCollider - How Data & AI Are Shaping Sport",
    date: "July 2, 2026",
    excerpt:
      "Big things coming... High Level Throwing® will be presenting in Toronto, ON @ Northeastern University at the SuperCollider with my data and analytics teams, Polar Labs & PRAKTIKAI, on our...",
    image:
      "https://highlevelthrowing.com/cdn/shop/articles/732116897_1380540203897571_8968972756082961469_n_58b93603-66f9-4bb1-992c-fb98c5517a36.jpg?v=1783039693&width=900",
    href: "https://highlevelthrowing.com/blogs/news/high-level-throwing%C2%AE-x-supercollider-how-data-ai-are-shaping-sport",
  },
  {
    title: "High Level Throwing x USA Softball - Top Softball Athletes Gather in OKC for 2026 HPP Top Performer's Camp",
    date: "June 26, 2026",
    excerpt:
      "OKLAHOMA CITY — The USA Softball High Performance Program (HPP) Top Performers Camp is underway as athletes from across the country arrive in Oklahoma City for four days of elite training...",
    image:
      "https://highlevelthrowing.com/cdn/shop/articles/730608683_1348366604153006_233357622436173440_n_fe663d50-80ff-4de4-8dda-08deb911d507.jpg?v=1782522267&width=900",
    href: "https://highlevelthrowing.com/blogs/news/hlt-x-usa-softball-top-athletes-gather-in-okc-for-2026-hpp-top-performer-s-camp",
  },
  {
    title: "NTangible's Pursuit to Make Clutch a Measurable Attribute - Sports Business Journal",
    date: "June 26, 2026",
    excerpt:
      "When it comes to human performance, clutch is still a polarizing topic. Is it even real? The analytical stat heads say no, but anyone who's seen a game-winning shot or...",
    image:
      "https://highlevelthrowing.com/cdn/shop/articles/Screen_Shot_2026-06-26_at_8.51.04_PM_5cca37a1-a7e7-450d-9e11-4c468156597f.png?v=1782522906&width=900",
    href: "https://highlevelthrowing.com/blogs/news/ntangibles-pursuit-to-make-clutch-a-measurable-attribute",
  },
  {
    title: "Softball Throwing Velocity - NEW Leader",
    date: "May 26, 2026",
    excerpt: "We have a new athlete on the leaderboard. Topping out at 72mph overhand! This 2030 athlete is a rising star in her class!",
    image:
      "https://highlevelthrowing.com/cdn/shop/articles/Screen_Shot_2026-05-26_at_10.19.28_AM_09665dff-cfdc-4402-911e-582bba0a3abc.png?v=1779805238&width=900",
    href: "https://highlevelthrowing.com/blogs/news/softball-velocity-new-leader",
  },
  {
    title: "High Level Throwing - Velocity Leaderboard",
    date: "May 24, 2026",
    excerpt:
      "Join the HLT Leaderboard and compete against athletes around the world! Earn your VELOCITY BADGE and showcase them in your recruiting profiles! Do you have the strongest arm on the...",
    image: "https://highlevelthrowing.com/cdn/shop/articles/70mph_club_wste.png?v=1779631255&width=900",
    href: "https://highlevelthrowing.com/blogs/news/high-level-throwing-velocity-leaderboard",
  },
  {
    title: "NTangible and Alliance Fastpitch Embark on the Largest Mental Performance Data Initiative in Youth Sports History",
    date: "May 11, 2026",
    excerpt:
      "NTangible, the cognitive performance analytics company behind the Clutch Factor, is expanding its existing partnership with Alliance Fastpitch, the largest youth softball organization in America. Under the expanded agreement, close...",
    image: "https://highlevelthrowing.com/cdn/shop/articles/ntangible-alliance-linkedin-1200x627.png?v=1778508302&width=900",
    href: "https://highlevelthrowing.com/blogs/news/ntangible-and-alliance-fastpitch-embark-on-the-largest-mental-performance-data-initiative-in-youth-sports-history",
  },
];

export default function ArticlesPage() {
  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Articles</div>
        <h2>News &amp; Training Articles</h2>
        <p>The latest from High Level Throwing — partnerships, leaderboard updates, and research.</p>
      </div>
      <div className="article-grid">
        {ARTICLES.map((article, index) => (
          <a className="article-card" href={article.href} target="_blank" rel="noopener" key={article.href}>
            <div className="thumb">
              <Image src={article.image} alt={article.title} fill unoptimized priority={index < 3} />
            </div>
            <div className="body">
              <span className="article-date">{article.date}</span>
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <span className="card-link">Read more →</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
