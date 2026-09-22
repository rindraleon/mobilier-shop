import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import Button from "../ui/Button";
import type { SellerStatus } from "../../types/api";

interface AccessDeniedProps {
  sellerStatus?: SellerStatus | null;
}

const SELLER_MESSAGES: Record<SellerStatus, { title: string; text: string }> = {
  pending: {
    title: "Demande en cours de validation",
    text: "Votre demande vendeur a bien été reçue. Un administrateur doit la valider avant que vous puissiez publier des produits. Vous recevrez un e-mail dès que votre boutique sera active.",
  },
  rejected: {
    title: "Demande refusée",
    text: "Votre demande vendeur a été refusée. Contactez-nous pour connaître les raisons et soumettre un nouveau dossier.",
  },
  suspended: {
    title: "Boutique suspendue",
    text: "Votre boutique est actuellement suspendue. La vente est désactivée le temps du traitement par un administrateur.",
  },
  approved: {
    title: "Accès refusé",
    text: "Vous n'avez pas accès à cette page.",
  },
};

/** Page 403 applicative : explique **pourquoi** l'accès est refusé. */
export default function AccessDenied({ sellerStatus }: AccessDeniedProps) {
  const message = sellerStatus ? SELLER_MESSAGES[sellerStatus] : null;

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-error-container text-on-error-container">
        <ShieldAlert size={30} />
      </span>
      <h1 className="mt-6 font-display text-display-md text-primary">
        {message?.title ?? "Accès refusé"}
      </h1>
      <p className="mt-3 max-w-lg text-body-lg text-on-surface-variant">
        {message?.text ??
          "Vous n'avez pas les droits nécessaires pour consulter cette page."}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/" variant="primary">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Button>
        {sellerStatus === "rejected" && (
          <Button as={Link} to="/contact" variant="outline">
            Nous contacter
          </Button>
        )}
      </div>
    </div>
  );
}
