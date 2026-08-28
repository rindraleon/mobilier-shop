import { Link } from "react-router-dom";
import { Home, Sofa } from "lucide-react";
import Button from "../../components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[65vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-display text-8xl text-secondary/30 md:text-9xl">404</p>
      <h1 className="mt-4 font-display text-display-md text-primary">Cette page a déménagé</h1>
      <p className="mt-3 max-w-md text-body-lg text-on-surface-variant">
        La page que vous cherchez n'existe pas ou plus. Mais notre boutique, elle, vous attend — canapés compris.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button as={Link} to="/" variant="accent" size="lg">
          <Home size={18} /> Retour à l'accueil
        </Button>
        <Button as={Link} to="/boutique" variant="outline" size="lg">
          <Sofa size={18} /> Voir la boutique
        </Button>
      </div>
    </div>
  );
}
