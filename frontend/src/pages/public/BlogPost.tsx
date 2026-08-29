import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, Newspaper } from "lucide-react";
import { initialBlogPosts } from "../../data/blog";
import { formatDate } from "../../utils/format";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Reveal from "../../components/ui/Reveal";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = initialBlogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="container-app py-20">
        <EmptyState
          icon={Newspaper}
          title="Article introuvable"
          text="Cet article n'existe pas ou a été déplacé."
          actionLabel="Retour au blog"
          actionTo="/blog"
        />
      </div>
    );
  }

  const others = initialBlogPosts.filter((p) => p.id !== post.id).slice(0, 2);

  return (
    <div className="container-app py-8 lg:py-12">
      <Breadcrumbs
        items={[{ label: "Accueil", to: "/" }, { label: "Blog", to: "/blog" }, { label: post.title }]}
      />

      <article className="mx-auto mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="flex items-center gap-1.5 text-label-sm text-on-surface-variant">
            <Clock size={14} /> {post.readTime} min de lecture
          </span>
          <span className="text-label-sm text-on-surface-variant">
            {post.author} · {formatDate(post.date)}
          </span>
        </div>

        <h1 className="mt-4 font-display text-display-md text-primary">{post.title}</h1>

        <Reveal className="mt-7">
          <div className="overflow-hidden rounded-xl shadow-card">
            <img src={post.image} alt={post.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        </Reveal>

        <div className="mt-8 space-y-6">
          {post.content.map((paragraph, i) => (
            <p key={i} className="text-body-lg leading-relaxed text-on-surface-variant">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-outline-variant/50 pt-6">
          <Button as={Link} to="/blog" variant="outline">
            <ArrowLeft size={16} /> Tous les articles
          </Button>
          <Button as={Link} to="/boutique" variant="ghost">
            Voir la boutique <ArrowRight size={16} />
          </Button>
        </div>
      </article>

      {/* À lire aussi */}
      <div className="mx-auto mt-14 max-w-5xl">
        <h2 className="mb-6 font-display text-headline-md text-primary">À lire aussi</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {others.map((other) => (
            <Link
              key={other.id}
              to={`/blog/${other.slug}`}
              className="group flex gap-5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <img
                src={other.image}
                alt={other.title}
                loading="lazy"
                className="h-24 w-32 shrink-0 rounded-md object-cover"
              />
              <div className="min-w-0">
                <Badge variant="secondary">{other.category}</Badge>
                <h3 className="mt-2 line-clamp-2 font-display text-headline-sm text-primary group-hover:text-secondary">
                  {other.title}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-label-md text-secondary">
                  Lire <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
