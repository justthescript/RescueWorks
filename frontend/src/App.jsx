import React, { useState, useEffect, useMemo, useCallback } from "react";
import api, { setAuthToken } from "./api";

// Modern color palette with dark mode support
const themes = {
  light: {
    background: "#f8fafc",
    backgroundSecondary: "#ffffff",
    header: "#0f172a",
    headerGradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    accent: "#3b82f6",
    accentHover: "#2563eb",
    accentGradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    cardBorder: "#e2e8f0",
    text: "#0f172a",
    textMuted: "#64748b",
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    shadowLg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  dark: {
    background: "#0f172a",
    backgroundSecondary: "#1e293b",
    header: "#020617",
    headerGradient: "linear-gradient(135deg, #020617 0%, #0f172a 100%)",
    accent: "#60a5fa",
    accentHover: "#3b82f6",
    accentGradient: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    cardBorder: "#334155",
    text: "#f1f5f9",
    textMuted: "#94a3b8",
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.3), 0 1px 2px -1px rgb(0 0 0 / 0.3)",
    shadowLg: "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
  }
};

// Enhanced layout styles with animations
const getLayoutStyles = (colors) => ({
  page: {
    minHeight: "100vh",
    background: colors.background,
    color: colors.text,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    transition: "all 0.3s ease",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 2rem",
    background: colors.headerGradient,
    color: "white",
    boxShadow: colors.shadowLg,
    position: "sticky",
    top: 0,
    zIndex: 100,
    backdropFilter: "blur(10px)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    fontWeight: 700,
    fontSize: "1.25rem",
    letterSpacing: "-0.025em",
  },
  nav: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "center",
  },
  navButton: (active) => ({
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    border: "none",
    background: active ? "rgba(255, 255, 255, 0.15)" : "transparent",
    color: "white",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
    backdropFilter: "blur(10px)",
  }),
  content: {
    maxWidth: "1400px",
    margin: "2rem auto",
    padding: "0 2rem 3rem",
  },
  card: {
    border: `1px solid ${colors.cardBorder}`,
    borderRadius: "1rem",
    background: colors.backgroundSecondary,
    padding: "1.5rem",
    boxShadow: colors.shadow,
    transition: "all 0.2s ease",
  },
  button: (variant = "primary") => ({
    padding: "0.625rem 1.25rem",
    borderRadius: "0.5rem",
    border: "none",
    background: variant === "primary" ? colors.accentGradient : 
                variant === "danger" ? colors.danger : 
                variant === "success" ? colors.success : "transparent",
    color: "white",
    fontWeight: 600,
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
  }),
  input: {
    width: "100%",
    padding: "0.625rem 0.875rem",
    borderRadius: "0.5rem",
    border: `1px solid ${colors.cardBorder}`,
    fontSize: "0.9rem",
    background: colors.backgroundSecondary,
    color: colors.text,
    transition: "all 0.2s ease",
  },
  badge: (status) => ({
    display: "inline-block",
    padding: "0.25rem 0.75rem",
    borderRadius: "9999px",
    fontSize: "0.75rem",
    fontWeight: 600,
    background: status === "completed" || status === "adopted" ? colors.success :
                status === "in_progress" || status === "in_foster" ? colors.warning :
                status === "pending" || status === "available" ? colors.accent :
                status === "urgent" || status === "high" ? colors.danger : colors.textMuted,
    color: "white",
  }),
  statCard: {
    background: colors.accentGradient,
    color: "white",
    padding: "1.5rem",
    borderRadius: "1rem",
    boxShadow: colors.shadowLg,
    transition: "all 0.2s ease",
  },
});

const LoadingSpinner = () => (
  <div style={{
    display: "inline-block",
    width: "20px",
    height: "20px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderRadius: "50%",
    borderTopColor: "white",
    animation: "spin 0.8s linear infinite",
  }}>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const SearchBar = ({ value, onChange, placeholder, colors }) => (
  <div style={{ position: "relative", maxWidth: "400px" }}>
    <span style={{
      position: "absolute",
      left: "0.875rem",
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: "1.1rem",
    }}>🔍</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "0.625rem 0.875rem 0.625rem 2.5rem",
        borderRadius: "0.5rem",
        border: `1px solid ${colors.cardBorder}`,
        fontSize: "0.9rem",
        background: colors.backgroundSecondary,
        color: colors.text,
        transition: "all 0.2s ease",
      }}
    />
  </div>
);

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  
  const colors = themes[isDark ? "dark" : "light"];
  const styles = getLayoutStyles(colors);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("username", email);
      form.append("password", password);
      const res = await api.post("/auth/token", form);
      const token = res.data.access_token;
      setAuthToken(token);
      onLogin(token);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={{
        position: "absolute",
        top: "1rem",
        right: "1rem",
        zIndex: 10,
      }}>
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            ...styles.button("primary"),
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
      
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
      }}>
        <div style={{
          width: "100%",
          maxWidth: "450px",
          ...styles.card,
          boxShadow: colors.shadowLg,
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{
              fontSize: "3rem",
              marginBottom: "1rem",
            }}>🐾</div>
            <h1 style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
              background: colors.accentGradient,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Welcome to RescueWorks</h1>
            <p style={{
              color: colors.textMuted,
              fontSize: "0.95rem",
            }}>
              Sign in to manage your rescue organization
            </p>
          </div>

          {error && (
            <div style={{
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              background: colors.danger,
              color: "white",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: colors.text,
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
                placeholder="you@example.com"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: colors.text,
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button("primary"),
                width: "100%",
                justifyContent: "center",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <LoadingSpinner /> : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ colors, styles }) {
  const [pets, setPets] = useState([]);
  const [apps, setApps] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [adoptionStats, setAdoptionStats] = useState([]);
  const [donationsSummary, setDonationsSummary] = useState({ total_donations: 0 });
  const [petsByStatus, setPetsByStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [p, a, t, ad, ds, ps] = await Promise.all([
          api.get("/pets"),
          api.get("/applications"),
          api.get("/tasks"),
          api.get("/stats/adoptions_by_month"),
          api.get("/stats/donations_summary"),
          api.get("/stats/pets_by_status"),
        ]);
        setPets(p.data);
        setApps(a.data);
        setTasks(t.data);
        setAdoptionStats(ad.data);
        setDonationsSummary(ds.data);
        setPetsByStatus(ps.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredPets = useMemo(() => {
    return pets.filter(pet => {
      const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (pet.species || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || pet.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [pets, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const totalDonations = Number(donationsSummary.total_donations || 0);
    const availablePets = petsByStatus.find(s => s.status === "available")?.count || 0;
    const pendingApps = apps.filter(a => a.status === "submitted" || a.status === "under_review").length;
    const urgentTasks = tasks.filter(t => t.priority === "urgent" && t.status !== "completed").length;
    
    return { totalDonations, availablePets, pendingApps, urgentTasks };
  }, [donationsSummary, petsByStatus, apps, tasks]);

  if (loading) {
    return (
      <div style={{
        ...styles.content,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}>
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner />
          <p style={{ marginTop: "1rem", color: colors.textMuted }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.content}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem",
      }}>
        <div>
          <h1 style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
          }}>Dashboard</h1>
          <p style={{ color: colors.textMuted, fontSize: "0.95rem" }}>
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem",
      }}>
        <div style={{
          ...styles.statCard,
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏠</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.availablePets}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Available for Adoption</div>
        </div>

        <div style={{
          ...styles.statCard,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💰</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>${stats.totalDonations.toFixed(0)}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Total Donations</div>
        </div>

        <div style={{
          ...styles.statCard,
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📋</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.pendingApps}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Pending Applications</div>
        </div>

        <div style={{
          ...styles.statCard,
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.urgentTasks}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>Urgent Tasks</div>
        </div>
      </div>

      <div style={{ ...styles.card, marginBottom: "2rem" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            🐾 Pets ({filteredPets.length})
          </h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search pets..."
              colors={colors}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                ...styles.input,
                width: "auto",
                minWidth: "150px",
              }}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="in_foster">In Foster</option>
              <option value="pending">Pending</option>
              <option value="adopted">Adopted</option>
            </select>
          </div>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}>
          {filteredPets.slice(0, 6).map((pet) => (
            <div
              key={pet.id}
              style={{
                ...styles.card,
                padding: "1rem",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = colors.shadowLg;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = colors.shadow;
              }}
            >
              {pet.photo_url && (
                <img
                  src={pet.photo_url}
                  alt={pet.name}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "0.75rem",
                    marginBottom: "0.75rem",
                  }}
                />
              )}
              <h3 style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                marginBottom: "0.25rem",
              }}>{pet.name}</h3>
              <p style={{
                fontSize: "0.875rem",
                color: colors.textMuted,
                marginBottom: "0.5rem",
              }}>
                {pet.species} • {pet.breed || "Mixed"}
              </p>
              <span style={styles.badge(pet.status)}>
                {pet.status.replace("_", " ").toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: "1.25rem",
      }}>
        <div style={styles.card}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            📝 Recent Applications
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {apps.slice(0, 5).map((app) => (
              <div
                key={app.id}
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  background: colors.background,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                    {app.type} Application
                  </div>
                  <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>
                    {app.applicant_name || "Applicant"}
                  </div>
                </div>
                <span style={styles.badge(app.status)}>
                  {app.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            ✅ Tasks & To-Dos
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {tasks.slice(0, 5).map((task) => (
              <div
                key={task.id}
                style={{
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  background: colors.background,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>
                    Due: {task.due_date || "No due date"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <span style={styles.badge(task.priority)}>
                    {task.priority}
                  </span>
                  <span style={styles.badge(task.status)}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({ colors, styles }) {
  const [org, setOrg] = useState({ name: "", logo_url: "", primary_contact_email: "" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/settings");
        setOrg(res.data.organization);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    load();
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await api.put("/settings", { organization: org });
      setMessage("Settings saved successfully! ✅");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save settings", err);
      setMessage("Failed to save settings. ❌");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.content}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        ⚙️ Settings
      </h1>
      <p style={{ color: colors.textMuted, marginBottom: "2rem", fontSize: "0.95rem" }}>
        Manage your organization profile and preferences
      </p>

      <div style={{ maxWidth: "600px" }}>
        <div style={styles.card}>
          {message && (
            <div style={{
              marginBottom: "1.5rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.5rem",
              background: message.includes("✅") ? colors.success : colors.danger,
              color: "white",
              fontSize: "0.9rem",
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}>
                Organization Name
              </label>
              <input
                type="text"
                value={org.name}
                onChange={(e) => setOrg({ ...org, name: e.target.value })}
                style={styles.input}
                placeholder="Paws & Claws Rescue"
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}>
                Logo URL
              </label>
              <input
                type="url"
                value={org.logo_url}
                onChange={(e) => setOrg({ ...org, logo_url: e.target.value })}
                style={styles.input}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}>
                Primary Contact Email
              </label>
              <input
                type="email"
                value={org.primary_contact_email}
                onChange={(e) => setOrg({ ...org, primary_contact_email: e.target.value })}
                style={styles.input}
                placeholder="contact@rescue.org"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...styles.button("primary"),
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? <LoadingSpinner /> : "Save Settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MyPortal({ colors, styles }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/portal/me");
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load portal", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{
        ...styles.content,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}>
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner />
          <p style={{ marginTop: "1rem", color: colors.textMuted }}>Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div style={styles.content}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        👤 My Portal
      </h1>
      <p style={{ color: colors.textMuted, marginBottom: "2rem", fontSize: "0.95rem" }}>
        Your personal dashboard for applications, foster pets, and tasks
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "1.5rem",
      }}>
        <div style={styles.card}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            📝 My Applications
            <span style={{
              ...styles.badge(),
              marginLeft: "auto",
            }}>
              {summary.my_applications.length}
            </span>
          </h3>
          {summary.my_applications.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: colors.textMuted }}>
              No applications yet.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {summary.my_applications.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    background: colors.background,
                  }}
                >
                  <div style={{ fontWeight: 500 }}>{a.type}</div>
                  <span style={styles.badge(a.status)}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            🏠 My Foster Pets
            <span style={{
              ...styles.badge(),
              marginLeft: "auto",
            }}>
              {summary.my_foster_pets.length}
            </span>
          </h3>
          {summary.my_foster_pets.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: colors.textMuted }}>
              No foster pets assigned.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {summary.my_foster_pets.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    background: colors.background,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <div style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "0.5rem",
                    background: colors.accentGradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                  }}>
                    🐾
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: "0.85rem", color: colors.textMuted }}>
                      {p.species}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            ✅ My Tasks
            <span style={{
              ...styles.badge(),
              marginLeft: "auto",
            }}>
              {summary.my_tasks.length}
            </span>
          </h3>
          {summary.my_tasks.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: colors.textMuted }}>
              No tasks assigned.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {summary.my_tasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "0.5rem",
                    background: colors.background,
                  }}
                >
                  <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                    {t.title}
                  </div>
                  <span style={styles.badge(t.status)}>{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VetPortal({ colors, styles }) {
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState(null);
  const [medical, setMedical] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadPets() {
      try {
        const res = await api.get("/vet/pets");
        setPets(res.data);
      } catch (err) {
        console.error("Failed to load vet pets", err);
      } finally {
        setLoading(false);
      }
    }
    loadPets();
  }, []);

  const filteredPets = useMemo(() => {
    return pets.filter(pet =>
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.species || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pets, searchTerm]);

  async function selectPet(pet) {
    setSelectedPet(pet);
    setMedical([]);
    try {
      const res = await api.get(`/vet/pets/${pet.id}/medical`);
      setMedical(res.data);
    } catch (err) {
      console.error("Failed to load medical", err);
    }
  }

  if (loading) {
    return (
      <div style={{
        ...styles.content,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}>
        <div style={{ textAlign: "center" }}>
          <LoadingSpinner />
          <p style={{ marginTop: "1rem", color: colors.textMuted }}>Loading vet portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.content}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        🏥 Veterinary Portal
      </h1>
      <p style={{ color: colors.textMuted, marginBottom: "2rem", fontSize: "0.95rem" }}>
        Manage medical records and health information
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "350px 1fr",
        gap: "1.5rem",
      }}>
        <div style={styles.card}>
          <div style={{ marginBottom: "1rem" }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search pets..."
              colors={colors}
            />
          </div>
          
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: 600,
            marginBottom: "1rem",
          }}>
            Patients ({filteredPets.length})
          </h3>
          
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            maxHeight: "600px",
            overflowY: "auto",
          }}>
            {filteredPets.map((p) => (
              <button
                key={p.id}
                onClick={() => selectPet(p)}
                style={{
                  ...styles.card,
                  padding: "0.75rem",
                  cursor: "pointer",
                  background: selectedPet && selectedPet.id === p.id ?
                    colors.accentGradient : colors.background,
                  color: selectedPet && selectedPet.id === p.id ? "white" : colors.text,
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.2s ease",
                }}
              >
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <div style={{
                  fontSize: "0.85rem",
                  opacity: 0.8,
                }}>
                  {p.species} • {p.breed || "Mixed"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          {selectedPet ? (
            <>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "1.5rem",
                paddingBottom: "1.5rem",
                borderBottom: `1px solid ${colors.cardBorder}`,
              }}>
                {selectedPet.photo_url && (
                  <img
                    src={selectedPet.photo_url}
                    alt={selectedPet.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "0.75rem",
                    }}
                  />
                )}
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
                    {selectedPet.name}
                  </h2>
                  <p style={{ color: colors.textMuted }}>
                    {selectedPet.species} • {selectedPet.breed || "Mixed"}
                  </p>
                  <span style={styles.badge(selectedPet.status)}>
                    {selectedPet.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
                📋 Medical Records
              </h3>

              {medical.length === 0 ? (
                <div style={{
                  textAlign: "center",
                  padding: "3rem 1rem",
                  color: colors.textMuted,
                }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
                  <p>No medical records yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {medical.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: "1rem",
                        borderRadius: "0.5rem",
                        background: colors.background,
                        border: `1px solid ${colors.cardBorder}`,
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "0.5rem",
                      }}>
                        <div style={{ fontWeight: 600 }}>
                          {m.description || m.note || "Medical Record"}
                        </div>
                        <div style={{
                          fontSize: "0.8rem",
                          color: colors.textMuted,
                        }}>
                          {new Date(m.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      {m.note && (
                        <p style={{
                          fontSize: "0.9rem",
                          color: colors.textMuted,
                          marginTop: "0.5rem",
                        }}>
                          {m.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{
              textAlign: "center",
              padding: "4rem 1rem",
              color: colors.textMuted,
            }}>
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏥</div>
              <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Select a Patient
              </h3>
              <p>Choose a pet from the list to view their medical history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(null);
  const [view, setView] = useState("dashboard");
  const [isDark, setIsDark] = useState(false);

  const colors = themes[isDark ? "dark" : "light"];
  const styles = getLayoutStyles(colors);

  if (!token) {
    return <Login onLogin={setToken} />;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <span role="img" aria-label="paw">🐾</span>
          <span>RescueWorks</span>
        </div>
        <nav style={styles.nav}>
          <button
            style={styles.navButton(view === "dashboard")}
            onClick={() => setView("dashboard")}
            onMouseEnter={(e) => {
              if (view !== "dashboard") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (view !== "dashboard") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            🏠 Dashboard
          </button>
          <button
            style={styles.navButton(view === "my")}
            onClick={() => setView("my")}
            onMouseEnter={(e) => {
              if (view !== "my") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (view !== "my") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            👤 My Portal
          </button>
          <button
            style={styles.navButton(view === "vet")}
            onClick={() => setView("vet")}
            onMouseEnter={(e) => {
              if (view !== "vet") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (view !== "vet") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            🏥 Vet Portal
          </button>
          <button
            style={styles.navButton(view === "settings")}
            onClick={() => setView("settings")}
            onMouseEnter={(e) => {
              if (view !== "settings") {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (view !== "settings") {
                e.currentTarget.style.background = "transparent";
              }
            }}
          >
            ⚙️ Settings
          </button>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              ...styles.navButton(false),
              marginLeft: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </button>
        </nav>
      </header>
      {view === "dashboard" && <Dashboard colors={colors} styles={styles} />}
      {view === "settings" && <SettingsPage colors={colors} styles={styles} />}
      {view === "my" && <MyPortal colors={colors} styles={styles} />}
      {view === "vet" && <VetPortal colors={colors} styles={styles} />}
    </div>
  );
}
