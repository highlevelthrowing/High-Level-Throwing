import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/shopify/articles";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Articles",
};

const ARTICLES = [
  {
    title: "The Role of the Scapula in Baseball and Softball Throwing",
    date: "October 7, 2026",
    excerpt:
      "The shoulder blade is the platform the throwing arm moves from. Why scapular movement sits at the centre of an efficient sequence — and why the scap pull is...",
    image: "/images/article-scapula-cover.jpg",
    href: "/blogs/news/the-role-of-the-scapula-in-baseball-and-softball-throwing",
  },
  {
    title: "What Is Arm Care Exactly? And Why Arm Care Is More Than Taking Care of the Arm",
    date: "October 7, 2026",
    excerpt:
      "Arm care isn't a few bands after practice. It's preparation, movement, sequencing, workload and recovery — and it starts long before the ball leaves...",
    image: "/images/article-armcare-cover.jpg",
    href: "/blogs/news/what-is-arm-care-exactly-and-why-arm-care-is-more-than-taking-care-of-the-arm",
  },
  {
    title: "The High Level Throwing® Breakdown: Understanding the Throw From the Ground Up",
    date: "October 7, 2026",
    excerpt:
      "A throw is a sequence — lower half, trunk, scapula and arm contributing in order. Breaking it down is what lets an athlete understand why they move, not just...",
    image: "/images/article-breakdown-cover.jpg",
    href: "/blogs/news/the-high-level-throwing-breakdown-understanding-the-throw-from-the-ground-up",
  },
  {
    title: "In Season Throwing: Take Care of Your Arm While You Compete",
    date: "October 6, 2026",
    excerpt:
      "Games, travel and repeated high-intent throws all add stress. The season is not the time to stop developing — it is the time to maintain movement, arm health and the ability to throw with...",
    image: "/images/article-inseason-cover.jpg",
    href: "/blogs/news/in-season-throwing-take-care-of-your-arm-while-you-compete",
  },
  {
    title: "Throwing Development Should Be in the Yearly Budget",
    date: "October 5, 2026",
    excerpt:
      "We budget for uniforms, tournament fees, travel and strength training. Throwing development is still treated as an extra — and for a skill every position on the field uses every day, that...",
    image: "/images/article-budget-cover.jpg",
    href: "/blogs/news/throwing-development-should-be-in-the-yearly-budget",
  },
  {
    title: "Why Some Common Throwing Drills Create More Problems Than They Solve",
    date: "October 2, 2026",
    excerpt:
      "If a drill looks like part of the throwing motion, it must be helping — right? Wrist flicks, L-drills and isolated arm-action work can teach patterns an athlete later has to...",
    image: "/images/article-wrist-flick-elbow-pain.jpg",
    href: "/blogs/news/why-some-common-throwing-drills-create-more-problems-than-they-solve",
  },
  {
    title: "Before You Specialize the Pitcher, Teach the Athlete to Throw",
    date: "October 2, 2026",
    excerpt:
      "A softball pitcher should learn how to be an athlete before she becomes a specialized pitcher. The windmill and the overhand throw are two different movement patterns — and one does not...",
    image: "/images/hlt-throw-guide.jpg",
    href: "/blogs/news/before-you-specialize-the-pitcher-teach-the-athlete-to-throw",
  },
  {
    title: "College Coaches Know HLT. Will You Be Ready?",
    date: "October 1, 2026",
    excerpt:
      "D1 and JUCO programs are already using High Level Throwing®. That means college coaches know what efficient throwing development looks like — and they can recognise it in a recruit without...",
    image: "/images/article-college-coaches.jpg",
    href: "/blogs/news/college-coaches-know-hlt-will-you-be-ready",
  },
  {
    title: "Are We Playing More Than We're Developing?",
    date: "September 28, 2026",
    excerpt:
      "Youth softball has never offered more chances to compete. But games are not the same thing as development — an athlete can play hundreds of innings and still reinforce inefficient throwing...",
    image: "/images/article-development-vs-competition.jpg",
    href: "/blogs/news/are-we-playing-more-than-were-developing",
  },
  {
    title: "NTangible: Twenty-Eight Went Pro. Here Is What Their Scores Looked Like.",
    date: "August 12, 2026",
    excerpt:
      "Every organization in baseball evaluates makeup. None of them could measure it. Velocity has a number. Exit speed has a number. How a player competes with the season on the...",
    image:
      "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/Screen_Shot_2026-08-12_at_8.40.52_AM.png?v=1786538561&width=900",
    href: "/blogs/news/ntangible-twenty-eight-went-pro-here-is-what-their-scores-looked-like",
  },
  {
    title: "High Level Throwing® x SuperCollider - How Data & AI Are Shaping Sport",
    date: "July 2, 2026",
    excerpt:
      "Big things coming... High Level Throwing® will be presenting in Toronto, ON @ Northeastern University at the SuperCollider with my data and analytics teams, Polar Labs & PRAKTIKAI, on our...",
    image:
      "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/732116897_1380540203897571_8968972756082961469_n_58b93603-66f9-4bb1-992c-fb98c5517a36.jpg?v=1783039693&width=900",
    href: "/blogs/news/high-level-throwing%C2%AE-x-supercollider-how-data-ai-are-shaping-sport",
  },
  {
    title: "High Level Throwing x USA Softball - Top Softball Athletes Gather in OKC for 2026 HPP Top Performer's Camp",
    date: "June 26, 2026",
    excerpt:
      "OKLAHOMA CITY — The USA Softball High Performance Program (HPP) Top Performers Camp is underway as athletes from across the country arrive in Oklahoma City for four days of elite training...",
    image:
      "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/730608683_1348366604153006_233357622436173440_n_fe663d50-80ff-4de4-8dda-08deb911d507.jpg?v=1782522267&width=900",
    href: "/blogs/news/hlt-x-usa-softball-top-athletes-gather-in-okc-for-2026-hpp-top-performer-s-camp",
  },
  {
    title: "NTangible's Pursuit to Make Clutch a Measurable Attribute - Sports Business Journal",
    date: "June 26, 2026",
    excerpt:
      "When it comes to human performance, clutch is still a polarizing topic. Is it even real? The analytical stat heads say no, but anyone who's seen a game-winning shot or...",
    image:
      "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/Screen_Shot_2026-06-26_at_8.51.04_PM_5cca37a1-a7e7-450d-9e11-4c468156597f.png?v=1782522906&width=900",
    href: "/blogs/news/ntangibles-pursuit-to-make-clutch-a-measurable-attribute",
  },
  {
    title: "Softball Throwing Velocity - NEW Leader",
    date: "May 26, 2026",
    excerpt: "We have a new athlete on the leaderboard. Topping out at 72mph overhand! This 2030 athlete is a rising star in her class!",
    image:
      "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/Screen_Shot_2026-05-26_at_10.19.28_AM_09665dff-cfdc-4402-911e-582bba0a3abc.png?v=1779805238&width=900",
    href: "/blogs/news/softball-velocity-new-leader",
  },
  {
    title: "High Level Throwing - Velocity Leaderboard",
    date: "May 24, 2026",
    excerpt:
      "Join the HLT Leaderboard and compete against athletes around the world! Earn your VELOCITY BADGE and showcase them in your recruiting profiles! Do you have the strongest arm on the...",
    image: "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/70mph_club_wste.png?v=1779631255&width=900",
    href: "/blogs/news/high-level-throwing-velocity-leaderboard",
  },
  {
    title: "NTangible and Alliance Fastpitch Embark on the Largest Mental Performance Data Initiative in Youth Sports History",
    date: "May 11, 2026",
    excerpt:
      "NTangible, the cognitive performance analytics company behind the Clutch Factor, is expanding its existing partnership with Alliance Fastpitch, the largest youth softball organization in America. Under the expanded agreement, close...",
    image: "https://cdn.shopify.com/s/files/1/0771/2948/2547/articles/ntangible-alliance-linkedin-1200x627.png?v=1778508302&width=900",
    href: "/blogs/news/ntangible-and-alliance-fastpitch-embark-on-the-largest-mental-performance-data-initiative-in-youth-sports-history",
  },
];

/**
 * The curated list above still supplies the artwork and hand-written excerpts
 * for the featured pieces; everything else on the blog is pulled live so a new
 * article appears here without an edit. Shopify is the source of truth for what
 * exists — the page used to show thirteen of seventy-eight.
 */
const CURATED = new Map(ARTICLES.map((a) => [a.href, a]));

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Prefer a set excerpt; most articles have none, so fall back to the body. */
function summarise(a: { excerpt: string | null; content: string | null }): string {
  const text = stripHtml(a.excerpt) || stripHtml(a.content);
  if (text.length <= 150) return text;
  const cut = text.slice(0, 150);
  return cut.slice(0, cut.lastIndexOf(" ")).trimEnd() + "\u2026";
}

function stripHtml(value: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default async function ArticlesPage() {
  const live = await getArticles().catch(() => []);

  const merged = live.length
    ? live.map((a) => {
        const href = `/blogs/news/${encodeURIComponent(a.handle)}`;
        const curated = CURATED.get(href);
        return {
          href,
          title: curated?.title ?? a.title,
          date: curated?.date ?? formatDate(a.publishedAt),
          excerpt: curated?.excerpt ?? summarise(a),
          image: curated?.image ?? a.image?.url ?? null,
        };
      })
    : ARTICLES.map((a) => ({ ...a, image: a.image as string | null }));

  return (
    <section>
      <div className="section-head">
        <div className="section-tag">Articles</div>
        <h2>News &amp; Training Articles</h2>
        <p>The latest from High Level Throwing — partnerships, leaderboard updates, and research.</p>
      </div>
      <div className="article-grid">
        {merged.map((article, index) => (
          <Link className="article-card" href={article.href} key={article.href}>
            <div className="thumb">
              {article.image && (
                <Image src={article.image} alt={article.title} fill unoptimized priority={index < 4} />
              )}
            </div>
            <div className="body">
              <span className="article-date">{article.date}</span>
              <h3>{article.title}</h3>
              {article.excerpt && <p>{article.excerpt}</p>}
              <span className="card-link">Read more →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
