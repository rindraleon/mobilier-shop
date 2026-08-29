import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { initialBlogPosts } from "../../data/blog";
import { formatDate } from "../../utils/format";
import SectionHeading from "../ui/SectionHeading";
import Reveal from "../ui/Reveal";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function BlogTeaser() {
  const posts = initialBlogPosts.slice(0, 3);
  return (
    <section className="container-app pb-14 md:pb-20 lg:pb-24">
      <SectionHeading
        eyebrow="Le journal"
        title="Conseils & inspirations"
        subtitle="Tendances, guides d'entretien et coulisses de nos ateliers."
        action={
          <Button as={Link} to="/blog" variant="outline">
            Tous les articles
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-3">
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
                <h3 className="mt-3 line-clamp-2 font-display text-headline-sm text-primary transition-colors group-hover:text-secondary">
                  {post.title}
                </h3>
                <p className="mt-2 line-clamp-2 flex-1 text-body-sm text-on-surface-variant">{post.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-label-md text-secondary">
                  Lire l'article <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
                <p className="mt-3 text-label-sm text-on-surface-variant/70">
                  {formatDate(post.date, { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
