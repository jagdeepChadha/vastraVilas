import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import ProdList from "./pages/ProdList/ProdList";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import Checkout from "./pages/Checkout/Checkout.jsx";
import { AuthContext } from "./contexts/AuthContext.jsx";
import OrderSummary from "./pages/OrderSummary/Ordersummary.jsx";
import Payments from "./pages/Payments/Payments.jsx";
import OrderConfirmation from "./pages/OrderConfirmation/Orderconfirmation.jsx";
import UserOrdersList from "./pages/UserOrdersList/UserOrdersList.jsx";
import ViewModifyOrder from "./pages/ViewModifyOrder/ViewModifyOrder.jsx";
import ProductPage from "./pages/ProductPage/ProductPage.jsx";
import YourReviews from "./pages/YourReviews/YourReviews.jsx";
import PrintInvoice from "./pages/PrintInvoice/PrintInvoice.jsx";

axios.defaults.withCredentials = true;

function App() {
  const { authenticated, isAdmin, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            authenticated ? (
              isAdmin ? (
                <Navigate to="/adminDashboard" />
              ) : (
                <Navigate to="/productList" />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/login"
          element={
            authenticated ? (
              isAdmin ? (
                <Navigate to="/adminDashboard" />
              ) : (
                <Navigate to="/productList" />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={authenticated ? <Navigate to="/" /> : <Signup />}
        />
        <Route
          path="/checkout"
          element={authenticated ? <Checkout /> : <Navigate to="/login" />}
        />
        <Route
          path="/productList"
          element={
            authenticated && !isAdmin ? <ProdList /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/orderSummary"
          element={
            authenticated && !isAdmin ? <OrderSummary /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/printInvoice"
          element={
            authenticated && !isAdmin ? <PrintInvoice /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/orders"
          element={
            authenticated && !isAdmin ? <UserOrdersList /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/payments"
          element={
            authenticated && !isAdmin ? <Payments /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/yourReviews"
          element={
            authenticated && !isAdmin ? <YourReviews /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/order-confirmation"
          element={
            authenticated && !isAdmin ? <OrderConfirmation /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/viewModifyOrder/:id"
          element={
            authenticated && !isAdmin ? <ViewModifyOrder /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/product/:id"
          element={
            authenticated && !isAdmin ? <ProductPage /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/adminDashboard"
          element={
            authenticated && isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
