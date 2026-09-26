"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Hash,
  Folder,
  Ruler,
  Warehouse,
  ArrowLeft,
  Save,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://localhost:9630/api";

export default function ProductsPage() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unitOfMeasure: "PCS",
    reorderPoint: "",
    initialStock: "",
    locationId: "",
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categoryError, setCategoryError] = useState("");
  const [locationError, setLocationError] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadCategories();
    loadLocations();
  }, []);

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  async function loadCategories() {
    try {
      setLoadingCategories(true);
      setCategoryError("");

      const response = await fetch(`${API_URL}/categories`);

      if (!response.ok) {
        throw new Error(
          `Unable to load categories (${response.status})`
        );
      }

      const result = await response.json();

      console.log("Categories API response:", result);

      const data = extractArray(result);

      setCategories(data);

      if (data.length === 0) {
        setCategoryError("No categories found.");
      }
    } catch (err) {
      console.error("Category loading error:", err);

      setCategories([]);
      setCategoryError(
        err.message || "Unable to load categories."
      );
    } finally {
      setLoadingCategories(false);
    }
  }

  // =========================================================
  // LOAD LOCATIONS
  // =========================================================

  async function loadLocations() {
    try {
      setLoadingLocations(true);
      setLocationError("");

      const response = await fetch(`${API_URL}/locations`);

      if (!response.ok) {
        throw new Error(
          `Unable to load locations (${response.status})`
        );
      }

      const result = await response.json();

      console.log("Locations API response:", result);

      const data = extractArray(result);

      setLocations(data);

      if (data.length === 0) {
        setLocationError("No locations found.");
      }
    } catch (err) {
      console.error("Location loading error:", err);

      setLocations([]);
      setLocationError(
        err.message || "Unable to load locations."
      );
    } finally {
      setLoadingLocations(false);
    }
  }

  // =========================================================
  // HANDLE DIFFERENT API RESPONSE FORMATS
  // =========================================================

  function extractArray(result) {
    if (Array.isArray(result)) {
      return result;
    }

    if (Array.isArray(result.data)) {
      return result.data;
    }

    if (Array.isArray(result.categories)) {
      return result.categories;
    }

    if (Array.isArray(result.locations)) {
      return result.locations;
    }

    if (Array.isArray(result.rows)) {
      return result.rows;
    }

    return [];
  }

  // =========================================================
  // FORM CHANGE
  // =========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------
    // Validation
    // -------------------------

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }

    if (!form.sku.trim()) {
      setError("SKU is required.");
      return;
    }

    if (!form.categoryId) {
      setError("Please select a category.");
      return;
    }

    if (!form.unitOfMeasure) {
      setError("Please select a unit of measure.");
      return;
    }

    const reorderPoint =
      form.reorderPoint === ""
        ? 0
        : Number(form.reorderPoint);

    const initialStock =
      form.initialStock === ""
        ? 0
        : Number(form.initialStock);

    if (Number.isNaN(reorderPoint) || reorderPoint < 0) {
      setError("Reorder point must be a valid positive number.");
      return;
    }

    if (Number.isNaN(initialStock) || initialStock < 0) {
      setError("Initial stock must be a valid positive number.");
      return;
    }

    if (initialStock > 0 && !form.locationId) {
      setError(
        "Please select an initial location when adding stock."
      );
      return;
    }

    // -------------------------
    // Payload
    // -------------------------

    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      categoryId: Number(form.categoryId),
      unitOfMeasure: form.unitOfMeasure,
      reorderPoint,
      initialStock,
      locationId: form.locationId
        ? Number(form.locationId)
        : null,
    };

    console.log("Creating product:", payload);

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      console.log("Create product response:", result);

      if (!response.ok) {
        throw new Error(
          result.error ||
            result.message ||
            "Failed to create product."
        );
      }

      setSuccess(
        `Product "${result.name || form.name}" created successfully.`
      );

      // Reset form
      setForm({
        name: "",
        sku: "",
        categoryId: "",
        unitOfMeasure: "PCS",
        reorderPoint: "",
        initialStock: "",
        locationId: "",
      });
    } catch (err) {
      console.error("Create product error:", err);

      setError(
        err.message || "Unable to create product."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-6 lg:p-8">

        {/* HEADER */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Add Product
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create a new product and configure its inventory settings.
            </p>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {/* ================================================= */}
            {/* PRODUCT INFORMATION */}
            {/* ================================================= */}

            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Package
                    size={20}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Product Information
                  </h2>

                  <p className="text-sm text-gray-500">
                    Basic information about the product.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* PRODUCT NAME */}
                <FormField
                  label="Product Name"
                  required
                  icon={Package}
                >
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Wireless Mouse Pro"
                    className={inputClass}
                  />
                </FormField>

                {/* SKU */}
                <FormField
                  label="SKU / Product Code"
                  required
                  icon={Hash}
                >
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. WM-001"
                    className={inputClass}
                  />
                </FormField>

                {/* CATEGORY */}
                <FormField
                  label="Category"
                  required
                  icon={Folder}
                >
                  <select
                    name="categoryId"
                    value={form.categoryId}
                    onChange={handleChange}
                    disabled={loadingCategories}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingCategories
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  {categoryError && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                      <AlertCircle size={14} />
                      <span>{categoryError}</span>

                      <button
                        type="button"
                        onClick={loadCategories}
                        className="font-medium underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </FormField>

                {/* UNIT */}
                <FormField
                  label="Unit of Measure"
                  required
                  icon={Ruler}
                >
                  <select
                    name="unitOfMeasure"
                    value={form.unitOfMeasure}
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="PCS">
                      Pieces (PCS)
                    </option>

                    <option value="BOX">
                      Box
                    </option>

                    <option value="KG">
                      Kilogram (KG)
                    </option>

                    <option value="G">
                      Gram (G)
                    </option>

                    <option value="LTR">
                      Liter (LTR)
                    </option>

                    <option value="MTR">
                      Meter (MTR)
                    </option>

                    <option value="SET">
                      Set
                    </option>
                  </select>
                </FormField>

              </div>
            </div>

            {/* ================================================= */}
            {/* INVENTORY */}
            {/* ================================================= */}

            <div className="p-6">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <Warehouse
                    size={20}
                    className="text-gray-700"
                  />
                </div>

                <div>
                  <h2 className="font-semibold text-gray-900">
                    Inventory Settings
                  </h2>

                  <p className="text-sm text-gray-500">
                    Configure initial stock and replenishment settings.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

                {/* REORDER POINT */}
                <FormField
                  label="Reorder Point"
                  icon={Package}
                >
                  <input
                    type="number"
                    min="0"
                    name="reorderPoint"
                    value={form.reorderPoint}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputClass}
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Stock level at which replenishment is needed.
                  </p>
                </FormField>

                {/* INITIAL STOCK */}
                <FormField
                  label="Initial Stock"
                  icon={Package}
                >
                  <input
                    type="number"
                    min="0"
                    name="initialStock"
                    value={form.initialStock}
                    onChange={handleChange}
                    placeholder="0"
                    className={inputClass}
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    Starting quantity for this product.
                  </p>
                </FormField>

                {/* LOCATION */}
                <FormField
                  label="Initial Location"
                  icon={Warehouse}
                >
                  <select
                    name="locationId"
                    value={form.locationId}
                    onChange={handleChange}
                    disabled={loadingLocations}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingLocations
                        ? "Loading locations..."
                        : "Select location"}
                    </option>

                    {locations.map((location) => (
                      <option
                        key={location.id}
                        value={location.id}
                      >
                        {location.name}
                      </option>
                    ))}
                  </select>

                  {locationError && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
                      <AlertCircle size={14} />

                      <span>{locationError}</span>

                      <button
                        type="button"
                        onClick={loadLocations}
                        className="font-medium underline"
                      >
                        Retry
                      </button>
                    </div>
                  )}

                  {!locationError &&
                    !loadingLocations &&
                    locations.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        Select where the initial stock will be stored.
                      </p>
                    )}
                </FormField>

              </div>
            </div>

            {/* ================================================= */}
            {/* ALERTS */}
            {/* ================================================= */}

            {(error || success) && (
              <div className="px-6 pb-6">

                {error && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{success}</span>
                  </div>
                )}

              </div>
            )}

            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <button
                type="button"
                onClick={() => {
                  setForm({
                    name: "",
                    sku: "",
                    categoryId: "",
                    unitOfMeasure: "PCS",
                    reorderPoint: "",
                    initialStock: "",
                    locationId: "",
                  });

                  setError("");
                  setSuccess("");
                }}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Clear Form
              </button>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving ||
                    loadingCategories ||
                    loadingLocations
                  }
                  className="flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Create Product
                    </>
                  )}
                </button>

              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

/* ========================================================= */
/* FORM FIELD */
/* ========================================================= */

function FormField({
  label,
  required = false,
  icon: Icon,
  children,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
        <Icon
          size={16}
          className="text-gray-500"
        />

        <span>{label}</span>

        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      {children}
    </div>
  );
}

/* ========================================================= */
/* INPUT STYLE */
/* ========================================================= */

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100";