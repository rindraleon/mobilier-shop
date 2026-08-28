import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { initialBlogPosts } from "../../data/blog";
import { formatDate } from "../../utils/format";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import Reveal from "../../components/ui/Reveal";

const [featured, ...posts] = initialBlogPosts;

export default function Blog() {
  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs items={[{ label: "Accueil", to: "/" }, { label: "Blog" }]} />

      <div className="mt-4 max-w-2xl">
        <h1 className="font-display text-display-md text-primary">Le journal d'Anti</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">
          Conseils d'aménagement, guides d'entretien et coulisses de nos ateliers — publié chaque mois par notre
          équipe.
        </p>
      </div>

      {/* Article vedette */}
      <Reveal className="mt-10">
        <Link
          to={`/blog/${featured.slug}`}
          className="group grid overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover md:grid-cols-2"
        >
          <div className="overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="h-full max-h-[380px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col justify-center p-8 md:p-10">
            <div className="flex items-center gap-3">
              <Badge variant="secondary">{featured.category}</Badge>
              <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                <Clock size={13} /> {featured.readTime} min de lecture
              </span>
            </div>
            <h2 className="mt-4 font-display text-headline-lg text-primary transition-colors group-hover:text-secondary">
              {featured.title}
            </h2>
            <p className="mt-3 text-body-md text-on-surface-variant">{featured.excerpt}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-label-md text-secondary">
              Lire l'article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
            <p className="mt-3 text-label-sm text-on-surface-variant/70">
              {featured.author} · {formatDate(featured.date)}
            </p>
          </div>
        </Link>
      </Reveal>

      {/* Autres articles */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {posts.map((post, i) => (
          <Reveal key={post.id} delay={i * 0.1}>
            <Link
              to={`/blog/${post.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface-container">
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{post.category}</Badge>
                  <span className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                    <Clock size={13} /> {post.readTime} min
                  </span>
                </div>
                <h3 className="mt-3 font-display text-headline-sm text-primary transition-colors group-hover:text-secondary">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-3 flex-1 text-body-sm text-on-surface-variant">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-label-md text-secondary">
                  Lire <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
