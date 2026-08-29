import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { StoreProvider } from "./context/StoreContext";
import { CartProvider } from "./context/CartContext";
import ScrollToTop from "./components/layout/ScrollToTop";
import PublicLayout from "./components/layout/PublicLayout";
import { RequireAuth, RequireAdmin } from "./components/layout/RequireAuth";
import ClientLayout from "./components/layout/ClientLayout";
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
import Wishlist from "./pages/public/Wishlist";
import NotFound from "./pages/public/NotFound";

import ClientDashboard from "./pages/client/ClientDashboard";
import ClientOrders from "./pages/client/ClientOrders";
import ClientOrderDetail from "./pages/client/ClientOrderDetail";
import ClientProfile from "./pages/client/ClientProfile";
import ClientAddresses from "./pages/client/ClientAddresses";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StoreProvider>
          <CartProvider>
            <ScrollToTop />
            <Routes>
              {/* Pages publiques */}
              <Route element={<PublicLayout />}>
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
                    <ClientLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<ClientDashboard />} />
                <Route path="commandes" element={<ClientOrders />} />
                <Route path="commandes/:id" element={<ClientOrderDetail />} />
                <Route path="profil" element={<ClientProfile />} />
                <Route path="adresses" element={<ClientAddresses />} />
              </Route>

              {/* Espace admin */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="produits" element={<AdminProducts />} />
                <Route path="commandes" element={<AdminOrders />} />
                <Route path="clients" element={<AdminCustomers />} />
              </Route>
            </Routes>
          </CartProvider>
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
