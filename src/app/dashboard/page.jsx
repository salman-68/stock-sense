"use client";

import { useEffect, useState } from "react";
import {
  Package,
  TriangleAlert,
  CircleOff,
  ArrowDownToLine,
  ArrowUpFromLine,
  RefreshCw,
  Plus,
  Wrench,
} from "lucide-react";

const API_URL = "http://localhost:9630/api";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/dashboard/kpis`);

      if (!response.ok) {
        throw new Error(`Failed to load dashboard (${response.status})`);
      }

      const data = await response.json();

      setDashboard(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError(err.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const getValue = (key, fallback = 0) => {
    if (!dashboard) return fallback;

    return dashboard[key] ?? dashboard.data?.[key] ?? fallback;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Loading inventory information...
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-xl bg-white shadow-sm"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-2xl font-semibold text-gray-900">
            Dashboard
          </h1>

          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-700">
              Unable to load dashboard
            </h2>

            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={fetchDashboard}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = getValue("totalProducts");
  const lowStock = getValue("lowStock");
  const outOfStock = getValue("outOfStock");
  const pendingReceipts = getValue("pendingReceipts");
  const pendingDeliveries = getValue("pendingDeliveries");
  const internalTransfers = getValue("scheduledTransfers");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-6 lg:p-8">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Inventory Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Monitor your StockSense inventory operations.
            </p>
          </div>

          <button
            onClick={fetchDashboard}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">

          <KpiCard
            title="Total Products"
            value={totalProducts}
            description="Products in stock"
            icon={Package}
          />

          <KpiCard
            title="Low Stock"
            value={lowStock}
            description="Products below reorder level"
            icon={TriangleAlert}
            warning
          />

          <KpiCard
            title="Out of Stock"
            value={outOfStock}
            description="Products with zero stock"
            icon={CircleOff}
            danger
          />

          <KpiCard
            title="Pending Receipts"
            value={pendingReceipts}
            description="Incoming operations"
            icon={ArrowDownToLine}
          />

          <KpiCard
            title="Pending Deliveries"
            value={pendingDeliveries}
            description="Outgoing operations"
            icon={ArrowUpFromLine}
          />

        </div>

        {/* Secondary section */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Internal Transfers */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-gray-500">
                  Internal Transfers
                </p>

                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {internalTransfers}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <RefreshCw size={22} strokeWidth={1.8} />
              </div>

            </div>

            <p className="mt-4 text-sm text-gray-500">
              Transfers scheduled between warehouse locations.
            </p>
          </div>

          {/* Inventory Status */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">

            <h2 className="text-lg font-semibold text-gray-900">
              Inventory Status
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

              <StatusItem
                title="Healthy Stock"
                value={Math.max(
                  0,
                  Number(totalProducts) -
                    Number(lowStock) -
                    Number(outOfStock)
                )}
                description="Products with sufficient stock"
              />

              <StatusItem
                title="Low Stock"
                value={lowStock}
                description="Needs attention"
              />

              <StatusItem
                title="Out of Stock"
                value={outOfStock}
                description="Requires replenishment"
              />

            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Inventory Operations
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Current inventory workflow status.
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">

            <OperationCard
              title="Receipts"
              value={pendingReceipts}
              description="Pending incoming stock"
              icon={ArrowDownToLine}
            />

            <OperationCard
              title="Deliveries"
              value={pendingDeliveries}
              description="Pending outgoing stock"
              icon={ArrowUpFromLine}
            />

            <OperationCard
              title="Transfers"
              value={internalTransfers}
              description="Scheduled internal transfers"
              icon={RefreshCw}
            />

          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h2 className="text-lg font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <QuickAction
              title="Add Product"
              description="Create a new inventory product"
              href="/products"
              icon={Plus}
            />

            <QuickAction
              title="New Receipt"
              description="Record incoming stock"
              href="/receipts"
              icon={ArrowDownToLine}
            />

            <QuickAction
              title="New Delivery"
              description="Create outgoing delivery"
              href="/deliveries"
              icon={ArrowUpFromLine}
            />

            <QuickAction
              title="Stock Adjustment"
              description="Correct physical stock"
              href="/adjustments"
              icon={Wrench}
            />

          </div>
        </div>

      </div>
    </div>
  );
}


/* ---------------- KPI CARD ---------------- */

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  warning,
  danger,
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-semibold ${
              danger
                ? "text-red-600"
                : warning
                ? "text-orange-600"
                : "text-gray-900"
            }`}
          >
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <Icon size={22} strokeWidth={1.8} />
        </div>

      </div>

      <p className="mt-3 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}


/* ---------------- STATUS ITEM ---------------- */

function StatusItem({ title, value, description }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">

      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold text-gray-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-gray-500">
        {description}
      </p>

    </div>
  );
}


/* ---------------- OPERATION CARD ---------------- */

function OperationCard({
  title,
  value,
  description,
  icon: Icon,
}) {
  return (
    <div className="p-6">

      <div className="flex items-center gap-4">

        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
          <Icon size={22} strokeWidth={1.8} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <p className="text-2xl font-semibold text-gray-900">
            {value}
          </p>
        </div>

      </div>

      <p className="mt-4 text-sm text-gray-500">
        {description}
      </p>

    </div>
  );
}


/* ---------------- QUICK ACTION ---------------- */

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}) {
  return (
    <a
      href={href}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
    >

      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
        <Icon size={21} strokeWidth={1.8} />
      </div>

      <h3 className="mt-4 font-semibold text-gray-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        {description}
      </p>

    </a>
  );
}