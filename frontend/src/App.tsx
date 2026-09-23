import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { ToastProvider } from "./context/ToastContext";
import PageLoader from "./components/ui/PageLoader";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import ScrollToTop from "./components/layout/ScrollToTop";
import PublicLayout from "./components/layout/PublicLayout";
import { RequireAuth, RequireAdmin, RequireSeller } from "./components/layout/RequireAuth";
import ClientLayout from "./components/layout/ClientLayout";
import SellerLayout from "./components/layout/SellerLayout";
import AdminLayout from "./components/layout/AdminLayout";

import Home from "./pages/public/Home";
import Shop from "./pages/public/Shop";
import ProductDetail from "./pages/public/ProductDetail";
import Collections from "./pages/public/Collections";
import About from "./pages/public/About";
import Blog from "./pages/public/Blog";
import BlogPost from "./pages/public/BlogPost";
import Contact from "./pages/public/Contact";
import CartPage from "./pages/public/CartPage";
import Checkout from "./pages/public/Checkout";
import OrderSuccess from "./pages/public/OrderSuccess";
import Login from "./pages/public/Login";
import ForgotPassword from "./pages/public/ForgotPassword";
import ResetPassword from "./pages/public/ResetPassword";
import Wishlist from "./pages/public/Wishlist";
import BecomeSeller from "./pages/public/BecomeSeller";
import NotFound from "./pages/public/NotFound";

import ClientDashboard from "./pages/client/ClientDashboard";
import ClientOrders from "./pages/client/ClientOrders";
import ClientOrderDetail from "./pages/client/ClientOrderDetail";
import ClientNotifications from "./pages/client/ClientNotifications";
import ClientProfile from "./pages/client/ClientProfile";
import ClientAddresses from "./pages/client/ClientAddresses";

const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard"));
const SellerProducts = lazy(() => import("./pages/seller/SellerProducts"));
const SellerProductForm = lazy(() => import("./pages/seller/SellerProductForm"));
const SellerOrders = lazy(() => import("./pages/seller/SellerOrders"));
const SellerOrderDetail = lazy(() => import("./pages/seller/SellerOrderDetail"));
const SellerSales = lazy(() => import("./pages/seller/SellerSales"));
const SellerPayments = lazy(() => import("./pages/seller/SellerPayments"));
const SellerProfile = lazy(() => import("./pages/seller/SellerProfile"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));
const AdminCustomers = lazy(() => import("./pages/admin/AdminCustomers"));
const AdminSellers = lazy(() => import("./pages/admin/AdminSellers"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));

/** Écran de transition pendant le chargement d'un espace privé. */
function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <PageLoader />
    </div>
  );
}

function SpaceBoundary({ space, children }: { space: string; children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <ErrorBoundary key={pathname} space={space} compact>
      {children}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ToastProvider>
        <ScrollToTop />
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Pages publiques */}
          <Route element={<SpaceBoundary space="Boutique"><PublicLayout /></SpaceBoundary>}>
            <Route path="/" element={<Home />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/boutique/:slug" element={<ProductDetail />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/panier" element={<CartPage />} />
            <Route path="/favoris" element={<Wishlist />} />
            <Route path="/connexion" element={<Login />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPassword />} />

            <Route
              path="/devenir-vendeur"
              element={
                <RequireAuth>
                  <BecomeSeller />
                </RequireAuth>
              }
            />
            <Route
              path="/commande"
              element={
                <RequireAuth>
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="/commande/succes/:id"
              element={
                <RequireAuth>
                  <OrderSuccess />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Espace client */}
          <Route
            path="/espace-client"
            element={
              <RequireAuth>
                <SpaceBoundary space="Espace client"><ClientLayout /></SpaceBoundary>
              </RequireAuth>
            }
          >
            <Route index element={<ClientDashboard />} />
            <Route path="commandes" element={<ClientOrders />} />
            <Route path="commandes/:id" element={<ClientOrderDetail />} />
            <Route path="notifications" element={<ClientNotifications />} />
            <Route path="profil" element={<ClientProfile />} />
            <Route path="adresses" element={<ClientAddresses />} />
          </Route>

          {/* Espace vendeur */}
          <Route
            path="/vendeur"
            element={
              <RequireAuth>
                <RequireSeller>
                  <SpaceBoundary space="Espace vendeur"><SellerLayout /></SpaceBoundary>
                </RequireSeller>
              </RequireAuth>
            }
          >
            <Route index element={<SellerDashboard />} />
            <Route path="produits" element={<SellerProducts />} />
            <Route path="produits/nouveau" element={<SellerProductForm />} />
            <Route path="produits/:id" element={<SellerProductForm />} />
            <Route path="commandes" element={<SellerOrders />} />
            <Route path="commandes/:id" element={<SellerOrderDetail />} />
            <Route path="ventes" element={<SellerSales />} />
            <Route path="paiements" element={<SellerPayments />} />
            <Route path="profil" element={<SellerProfile />} />
          </Route>

          {/* Espace administrateur */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <SpaceBoundary space="Administration"><AdminLayout /></SpaceBoundary>
              </RequireAdmin>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="produits" element={<AdminProducts />} />
            <Route path="commandes" element={<AdminOrders />} />
            <Route path="commandes/:id" element={<AdminOrderDetail />} />
            <Route path="clients" element={<AdminCustomers />} />
            <Route path="vendeurs" element={<AdminSellers />} />
            <Route path="paiements" element={<AdminPayments />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="statistiques" element={<AdminAnalytics />} />
            <Route path="journal" element={<AdminAuditLogs />} />
          </Route>
        </Routes>
        </Suspense>
      </ToastProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
