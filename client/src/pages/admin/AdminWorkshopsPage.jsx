
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Users,
  UserRoundCheck,
  Search,
  Plus,
  Pencil,
  X,
  LogOut,
  ArrowUpDown,
  Eye,
  CheckCircle2,
  Ban,
  LayoutDashboard,
  RefreshCw,
  Ticket,
} from "lucide-react";

import { useAdminAuth } from "../../context/AdminAuthContext";

import {
  getAdminWorkshops,
  createAdminWorkshop,
  updateAdminWorkshop,
  cancelAdminWorkshop,
  publishAdminWorkshop,
} from "../../services/adminWorkshopService";

const initialForm = {
  title: "",
  description: "",
  dateTime: "",
  capacity: "",
  whatsappLink: "",
};

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function toDateTimeLocal(value) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function StatCard({ label, value, icon: Icon, detail }) {
  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/[0.02]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy/55">{label}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream text-[#987438]">
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-navy">
        {value}
      </p>
      <p className="mt-1 text-xs text-navy/40">{detail}</p>
    </div>
  );
}

function WorkshopForm({ initialData, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...initialForm,
    ...(initialData
      ? {
          title: initialData.title || "",
          description: initialData.description || "",
          dateTime: toDateTimeLocal(initialData.dateTime),
          capacity: String(initialData.capacity ?? ""),
          whatsappLink: initialData.whatsappLink || "",
        }
      : {}),
  }));

  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (Number(form.capacity) < 1) {
      setFormError("Capacity must be at least 1.");
      return;
    }

    if (new Date(form.dateTime) <= new Date()) {
      setFormError("Please select a future workshop date and time.");
      return;
    }

    try {
      await onSave({
        title: form.title.trim(),
        description: form.description.trim(),
        dateTime: new Date(form.dateTime).toISOString(),
        capacity: Number(form.capacity),
        whatsappLink: form.whatsappLink.trim(),
      });
    } catch (error) {
      setFormError(error.message || "Unable to save workshop.");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-navy/12 bg-offwhite px-4 py-3 text-sm text-navy outline-none transition placeholder:text-navy/30 focus:border-gold";

  return (
    <div className="rounded-3xl border border-gold/30 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
            {initialData ? "Workshop settings" : "Create something inspiring"}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-navy">
            {initialData ? "Edit workshop" : "Create a new workshop"}
          </h2>
          <p className="mt-2 text-sm text-navy/50">
            {initialData
              ? "Update the details below. Changes will be saved for everyone."
              : "Fill in the details to add a workshop to the platform."}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-navy/45 transition hover:bg-cream hover:text-navy"
          aria-label="Close form"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-navy">
            Workshop title *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={150}
            placeholder="e.g. Design Thinking Masterclass"
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-navy">
            Description
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="Tell participants what they will learn..."
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-navy">
              Date and time *
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={form.dateTime}
              onChange={handleChange}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-navy">
              Participant capacity *
            </label>
            <input
              type="number"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              min="1"
              required
              placeholder="e.g. 100"
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-navy">
            WhatsApp group link *
          </label>
          <input
            type="url"
            name="whatsappLink"
            value={form.whatsappLink}
            onChange={handleChange}
            required
            placeholder="https://chat.whatsapp.com/..."
            className={inputClass}
          />
        </div>

        {formError && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-navy/15 px-6 py-3 text-sm font-semibold text-navy transition hover:bg-cream"
          >
            Discard
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-navy px-7 py-3 text-sm font-semibold text-white transition hover:bg-gold hover:text-navy disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : initialData
                ? "Save changes"
                : "Create workshop"}
          </button>
        </div>
      </form>
    </div>
  );
}

function WorkshopCard({ workshop, onEdit, onCancel, onPublish, actionLoading }) {
  const isCancelled = workshop.status === "CANCELLED";

  return (
    <article className="group rounded-2xl border border-navy/8 bg-white p-5 shadow-sm shadow-navy/[0.02] transition duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-lg hover:shadow-navy/[0.05] md:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.13em] ${
                isCancelled
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {workshop.status}
            </span>
            <span className="text-xs text-navy/35">
              Created {formatDate(workshop.createdAt)}
            </span>
          </div>

          <h3 className="font-display text-xl font-bold text-navy transition group-hover:text-[#987438]">
            {workshop.title}
          </h3>

          <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-navy/55">
            {workshop.description || "No description provided."}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-navy/55">
            <span className="flex items-center gap-2">
              <CalendarDays size={15} className="text-[#987438]" />
              {formatDate(workshop.dateTime)}
            </span>
            <span className="flex items-center gap-2">
              <Clock3 size={15} className="text-[#987438]" />
              {formatTime(workshop.dateTime)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl bg-offwhite p-3 lg:min-w-[245px]">
          <div className="text-center">
            <Users size={17} className="mx-auto text-[#987438]" />
            <p className="mt-2 font-display text-xl font-bold text-navy">
              {workshop.registrationCount}
            </p>
            <p className="text-[10px] text-navy/45">Registered</p>
          </div>
          <div className="border-x border-navy/10 text-center">
            <UserRoundCheck size={17} className="mx-auto text-[#987438]" />
            <p className="mt-2 font-display text-xl font-bold text-navy">
              {workshop.availableSeats}
            </p>
            <p className="text-[10px] text-navy/45">Available</p>
          </div>
          <div className="text-center">
            <Ticket size={17} className="mx-auto text-[#987438]" />
            <p className="mt-2 font-display text-xl font-bold text-navy">
              {workshop.capacity}
            </p>
            <p className="text-[10px] text-navy/45">Capacity</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-navy/8 pt-4">
        <button
          type="button"
          onClick={() => onEdit(workshop)}
          className="flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2.5 text-xs font-semibold text-navy transition hover:border-gold hover:bg-cream"
        >
          <Pencil size={14} /> Edit
        </button>

        <button
          type="button"
          onClick={() => isCancelled ? onPublish(workshop) : onCancel(workshop)}
          disabled={actionLoading}
          className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
            isCancelled
              ? "bg-green-50 text-green-700 hover:bg-green-100"
              : "bg-red-50 text-red-600 hover:bg-red-100"
          }`}
        >
          {isCancelled ? <CheckCircle2 size={14} /> : <Ban size={14} />}
          {isCancelled ? "Publish again" : "Cancel workshop"}
        </button>

        <button
          type="button"
          onClick={() => window.location.assign(
            `/admin/workshops/${workshop.id}/registrations`
          )}
          className="ml-auto flex items-center gap-2 rounded-full bg-navy px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-gold hover:text-navy"
        >
          <Eye size={14} /> See registrations
        </button>
      </div>
    </article>
  );
}

export default function AdminWorkshopsPage() {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdminAuth();

  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("DATE_ASC");
  const [showForm, setShowForm] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadWorkshops = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const response = await getAdminWorkshops();
      setWorkshops(response.data || []);
    } catch (error) {
      setPageError(error.message || "Unable to load workshops.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkshops();
  }, [loadWorkshops]);

  const filteredWorkshops = useMemo(() => {
    let result = [...workshops];

    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      result = result.filter((workshop) =>
        workshop.title?.toLowerCase().includes(keyword)
      );
    }

    if (statusFilter !== "ALL") {
      result = result.filter(
        (workshop) => workshop.status === statusFilter
      );
    }

    result.sort((a, b) => {
      if (sortBy === "DATE_ASC") {
        return new Date(a.dateTime) - new Date(b.dateTime);
      }
      if (sortBy === "DATE_DESC") {
        return new Date(b.dateTime) - new Date(a.dateTime);
      }
      if (sortBy === "REGISTRATIONS_DESC") {
        return b.registrationCount - a.registrationCount;
      }
      if (sortBy === "TITLE_ASC") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [workshops, search, statusFilter, sortBy]);

  const stats = useMemo(() => ({
    total: workshops.length,
    published: workshops.filter((w) => w.status === "PUBLISHED").length,
    cancelled: workshops.filter((w) => w.status === "CANCELLED").length,
    registrations: workshops.reduce(
      (sum, w) => sum + w.registrationCount,
      0
    ),
  }), [workshops]);

  function openCreateForm() {
    setEditingWorkshop(null);
    setShowForm(true);
  }

  function openEditForm(workshop) {
    setEditingWorkshop(workshop);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave(formData) {
    setSaving(true);
    try {
      if (editingWorkshop) {
        await updateAdminWorkshop(editingWorkshop.id, formData);
      } else {
        await createAdminWorkshop(formData);
      }

      setShowForm(false);
      setEditingWorkshop(null);
      await loadWorkshops();
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(workshop, action) {
    const message = action === "cancel"
      ? `Cancel "${workshop.title}"?`
      : `Publish "${workshop.title}" again?`;

    if (!window.confirm(message)) return;

    setActionLoading(true);
    setPageError("");

    try {
      if (action === "cancel") {
        await cancelAdminWorkshop(workshop.id);
      } else {
        await publishAdminWorkshop(workshop.id);
      }
      await loadWorkshops();
    } catch (error) {
      setPageError(error.message || "Unable to update workshop status.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logoutAdmin();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      setPageError(error.message || "Unable to log out.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F8F7]">
      <header className="sticky top-0 z-30 border-b border-navy/8 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-gold">
              <LayoutDashboard size={19} />
            </div>
            <div>
              <p className="font-display text-lg font-extrabold tracking-tight text-navy">
                WORKSHOP<span className="text-gold">.</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-navy/40">
                Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-navy">
                {admin?.name || "Administrator"}
              </p>
              <p className="text-xs text-navy/45">Admin account</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-navy/12 px-4 py-2.5 text-xs font-semibold text-navy transition hover:bg-cream"
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-5 py-9 md:px-8 md:py-12">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#987438]">
              Your control centre
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold text-navy md:text-4xl">
              Workshops
            </h1>
            <p className="mt-3 text-sm text-navy/50">
              Manage every workshop and keep track of your community.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="flex items-center justify-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-navy/10 transition hover:bg-gold hover:text-navy"
          >
            <Plus size={18} /> Create workshop
          </button>
        </div>

        {showForm && (
          <div className="mb-9">
            <WorkshopForm
              key={editingWorkshop?.id || "new-workshop"}
              initialData={editingWorkshop}
              onClose={() => {
                setShowForm(false);
                setEditingWorkshop(null);
              }}
              onSave={handleSave}
              saving={saving}
            />
          </div>
        )}

        <div className="mb-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total workshops"
            value={stats.total}
            icon={CalendarDays}
            detail="Across all administrators"
          />
          <StatCard
            label="Published"
            value={stats.published}
            icon={CheckCircle2}
            detail="Currently published"
          />
          <StatCard
            label="Cancelled"
            value={stats.cancelled}
            icon={Ban}
            detail="Cancelled workshops"
          />
          <StatCard
            label="Total registrations"
            value={stats.registrations}
            icon={Users}
            detail="Across all workshops"
          />
        </div>

        <section>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-navy">
                All workshops
              </h2>
              <p className="mt-1 text-xs text-navy/45">
                {filteredWorkshops.length} workshop(s) found
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="relative sm:col-span-1">
                <Search
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/35"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search workshops..."
                  className="w-full rounded-full border border-navy/12 bg-white py-3 pl-11 pr-4 text-xs outline-none focus:border-gold"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-full border border-navy/12 bg-white px-4 py-3 text-xs text-navy outline-none focus:border-gold"
              >
                <option value="ALL">All statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-full border border-navy/12 bg-white px-4 py-3 text-xs text-navy outline-none focus:border-gold"
              >
                <option value="DATE_ASC">Date: earliest first</option>
                <option value="DATE_DESC">Date: latest first</option>
                <option value="REGISTRATIONS_DESC">Most registrations</option>
                <option value="TITLE_ASC">Title: A–Z</option>
              </select>
            </div>
          </div>

          {pageError && (
            <div role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {pageError}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-56 items-center justify-center rounded-2xl border border-navy/8 bg-white">
              <div className="flex items-center gap-3 text-sm text-navy/50">
                <RefreshCw size={17} className="animate-spin" />
                Loading workshops...
              </div>
            </div>
          ) : filteredWorkshops.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-navy/15 bg-white px-6 py-16 text-center">
              <CalendarDays size={30} className="mx-auto text-gold" />
              <h3 className="mt-4 font-display text-lg font-bold text-navy">
                No workshops found
              </h3>
              <p className="mt-2 text-sm text-navy/50">
                Try changing your search or filters, or create a new workshop.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkshops.map((workshop) => (
                <WorkshopCard
                  key={workshop.id}
                  workshop={workshop}
                  onEdit={openEditForm}
                  onCancel={(item) => handleStatusChange(item, "cancel")}
                  onPublish={(item) => handleStatusChange(item, "publish")}
                  actionLoading={actionLoading}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
