import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout     from "./components/Layout";
import Overview   from "./pages/Overview";
import Deals      from "./pages/Deals";
import Companies  from "./pages/Companies";
import Contacts   from "./pages/Contacts";
import Tasks      from "./pages/Tasks";
import Invoices   from "./pages/Invoices";
import Outreaches from "./pages/Outreaches";
import { useSSE } from "./hooks/useSSE";

export default function App() {
  const [syncStatus, setSyncStatus] = useState("connecting");

  useSSE((msg) => {
    setSyncStatus("live");
  });

  return (
    <Layout syncStatus={syncStatus}>
      <Routes>
        <Route path="/"           element={<Overview />}   />
        <Route path="/deals"      element={<Deals />}      />
        <Route path="/companies"  element={<Companies />}  />
        <Route path="/contacts"   element={<Contacts />}   />
        <Route path="/tasks"      element={<Tasks />}      />
        <Route path="/invoices"   element={<Invoices />}   />
        <Route path="/outreaches" element={<Outreaches />} />
      </Routes>
    </Layout>
  );
}
