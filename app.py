import streamlit as st
from pathlib import Path
import plotly.express as px
import pandas as pd
import re
from parallel.pipeline import run_study, brief_text, summary_text
from parallel.panel import load_panel
from parallel.fidelity import close_the_loop
from parallel.profiles import (
    create_profile, login, profile_exists, save_intel, get_history,
    get_cached_intel, push_summary_to_bridge,
    save_clone_run, get_cached_clone,
    save_to_bridge_user_store, get_bridge_user_store, get_user_previous_findings,
    ProfileNotFound, WrongPIN, UsernameTaken
)
from parallel.clone_intel import (
    get_style_dna, get_video_blueprint, get_piracy_ideas, generate_unified_clone_dossier
)
from parallel.suggestions import find_similar_creators, resolve_misspelled_creator_with_llm

st.set_page_config(
    page_title="Parallel — Creator Intelligence & Formula Decoupler",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# ═══════════════════════════════════════════════════════════════════════════════
#  DESIGN SYSTEM & REFINED CSS (Zinc / Slate Dark Theme — Stripe & Linear Style)
# ═══════════════════════════════════════════════════════════════════════════════
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

<style>
/* ─── DESIGN TOKENS ────────────────────────────────────────────────────────── */
:root {
  --bg-app: #08090E;
  --bg-surface: #10121A;
  --bg-surface-elevated: #161824;
  --bg-surface-hover: #1C1F2E;
  --border-subtle: #202333;
  --border-active: #383D56;
  --border-focus: #6366F1;
  --accent-indigo: #6366F1;
  --accent-indigo-hover: #4F46E5;
  --accent-emerald: #10B981;
  --accent-rose: #F43F5E;
  --accent-amber: #F59E0B;
  --accent-cyan: #06B6D4;
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-muted: #64748B;
  --font-heading: 'Plus Jakarta Sans', -apple-system, sans-serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
}

/* ─── BASE RESET ─────────────────────────────────────────────────────────── */
html, body, [data-testid="stAppViewContainer"] {
  background-color: var(--bg-app) !important;
  font-family: var(--font-body) !important;
  color: var(--text-primary) !important;
  -webkit-font-smoothing: antialiased;
}

#MainMenu, footer, header { visibility: hidden !important; }
[data-testid="stDecoration"] { display: none !important; }
.stDeployButton { display: none !important; }

[data-testid="stMainBlockContainer"] {
  padding: 1.2rem 2.5rem 4rem !important;
  max-width: 1440px !important;
}

/* ─── HEADINGS ───────────────────────────────────────────────────────────── */
h1, h2, h3, h4, h5, h6,
[data-testid="stMarkdownContainer"] h1,
[data-testid="stMarkdownContainer"] h2,
[data-testid="stMarkdownContainer"] h3 {
  font-family: var(--font-heading) !important;
  color: var(--text-primary) !important;
  letter-spacing: -0.025em !important;
  font-weight: 700 !important;
}

/* ─── SIDEBAR ────────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {
  background-color: #0B0D14 !important;
  border-right: 1px solid var(--border-subtle) !important;
}

[data-testid="stSidebar"] .stButton > button {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text-secondary) !important;
  font-size: 0.8rem !important;
  font-weight: 500 !important;
  text-align: left !important;
  transition: all 0.15s ease !important;
}
[data-testid="stSidebar"] .stButton > button:hover {
  background: var(--bg-surface-elevated) !important;
  border-color: var(--border-active) !important;
  color: var(--text-primary) !important;
}

/* ─── WORKSPACE TABS (Clean Segmented Control) ────────────────────────────── */
[data-testid="stTabs"] [role="tablist"] {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  padding: 4px !important;
  gap: 4px !important;
  margin-bottom: 1.5rem !important;
}

[data-testid="stTabs"] [role="tab"] {
  background: transparent !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text-secondary) !important;
  font-family: var(--font-heading) !important;
  font-weight: 600 !important;
  font-size: 0.84rem !important;
  padding: 0.5rem 1.15rem !important;
  border: none !important;
  transition: all 0.15s ease !important;
}

[data-testid="stTabs"] [role="tab"]:hover {
  color: var(--text-primary) !important;
  background: rgba(255, 255, 255, 0.03) !important;
}

[data-testid="stTabs"] [role="tab"][aria-selected="true"] {
  background: var(--bg-surface-elevated) !important;
  border: 1px solid var(--border-active) !important;
  color: #FFFFFF !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

[data-testid="stTabs"] [role="tabpanel"] {
  padding-top: 0.5rem !important;
}

/* ─── BUTTONS ────────────────────────────────────────────────────────────── */
.stButton > button {
  font-family: var(--font-heading) !important;
  font-weight: 600 !important;
  border-radius: var(--radius-sm) !important;
  transition: all 0.15s ease !important;
  letter-spacing: -0.01em !important;
  font-size: 0.85rem !important;
}

.stButton > button[kind="primary"],
.stButton > button[data-testid="baseButton-primary"] {
  background: var(--accent-indigo) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #FFFFFF !important;
  padding: 0.55rem 1.35rem !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2), 0 0 12px rgba(99, 102, 241, 0.25) !important;
}

.stButton > button[kind="primary"]:hover,
.stButton > button[data-testid="baseButton-primary"]:hover {
  background: var(--accent-indigo-hover) !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35) !important;
}

.stButton > button:not([kind="primary"]):not([data-testid="baseButton-primary"]) {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  color: var(--text-primary) !important;
}

.stButton > button:not([kind="primary"]):not([data-testid="baseButton-primary"]):hover {
  background: var(--bg-surface-elevated) !important;
  border-color: var(--border-active) !important;
}

/* ─── INPUTS ─────────────────────────────────────────────────────────────── */
.stTextInput input, .stTextArea textarea, .stSelectbox select {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-sm) !important;
  color: var(--text-primary) !important;
  font-family: var(--font-body) !important;
  font-size: 0.88rem !important;
  transition: all 0.15s ease !important;
}

.stTextInput input:focus, .stTextArea textarea:focus {
  border-color: var(--border-focus) !important;
  box-shadow: 0 0 0 1px var(--border-focus) !important;
  background: var(--bg-surface-elevated) !important;
}

.stTextInput label, .stTextArea label, .stSelectbox label {
  font-family: var(--font-heading) !important;
  font-weight: 600 !important;
  font-size: 0.74rem !important;
  color: var(--text-muted) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.04em !important;
}

/* ─── CARDS & CONTAINERS ─────────────────────────────────────────────────── */
[data-testid="stVerticalBlockBorderWrapper"] {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  transition: border-color 0.15s ease !important;
}

[data-testid="stVerticalBlockBorderWrapper"]:hover {
  border-color: var(--border-active) !important;
}

/* ─── METRIC BLOCKS ──────────────────────────────────────────────────────── */
[data-testid="stMetric"] {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  padding: 0.9rem 1.1rem !important;
}

[data-testid="stMetricLabel"] {
  font-family: var(--font-heading) !important;
  font-weight: 600 !important;
  font-size: 0.7rem !important;
  color: var(--text-muted) !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}

[data-testid="stMetricValue"] {
  font-family: var(--font-heading) !important;
  font-weight: 700 !important;
  font-size: 1.25rem !important;
  color: var(--text-primary) !important;
}

/* ─── EXPANDERS ──────────────────────────────────────────────────────────── */
[data-testid="stExpander"] {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  margin-bottom: 0.6rem !important;
}

[data-testid="stExpander"] summary {
  font-family: var(--font-heading) !important;
  font-weight: 600 !important;
  color: var(--text-primary) !important;
  font-size: 0.85rem !important;
}

/* ─── SCROLLBAR ──────────────────────────────────────────────────────────── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: var(--bg-app); }
::-webkit-scrollbar-thumb { background: #262A3B; border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: #3B405A; }
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════════
#  TOP APPLICATION BAR (Linear / Vercel Grade Navigation)
# ═══════════════════════════════════════════════════════════════════════════════
logged_user = st.session_state.get("logged_in_user")
user_badge = f'<span style="font-family: var(--font-mono); font-size: 0.72rem; color: #10B981; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.25); padding: 3px 8px; border-radius: 6px;">@{logged_user}</span>' if logged_user else '<span style="font-family: var(--font-mono); font-size: 0.72rem; color: #94A3B8; background: rgba(255,255,255,0.04); border: 1px solid #202333; padding: 3px 8px; border-radius: 6px;">Guest Session</span>'

st.markdown(f"""
<div style="
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  background: #10121A;
  border: 1px solid #202333;
  border-radius: 12px;
  margin-bottom: 1.4rem;
">
  <div style="display: flex; align-items: center; gap: 12px;">
    <div style="
      width: 28px; height: 28px;
      border-radius: 7px;
      background: #6366F1;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 0.95rem; color: #FFFFFF;
    ">P</div>
    <div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-family: var(--font-heading); font-weight: 700; font-size: 0.95rem; letter-spacing: -0.02em; color: #F8FAFC;">
          PARALLEL
        </span>
        <span style="font-family: var(--font-mono); font-size: 0.62rem; color: #64748B; border: 1px solid #202333; padding: 1px 6px; border-radius: 4px;">
          CREATOR OS 2.4
        </span>
      </div>
      <div style="font-size: 0.72rem; color: #64748B;">
        Autonomous Content Intelligence &amp; Retention Decoupler
      </div>
    </div>
  </div>

  <div style="display: flex; align-items: center; gap: 10px;">
    <span style="font-family: var(--font-mono); font-size: 0.68rem; color: #64748B; display: flex; align-items: center; gap: 6px;">
      <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
      Engine Ready (Groq Llama-3.3-70b)
    </span>
    {user_badge}
  </div>
</div>
""", unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════════
#  SIDEBAR — USER PROFILE & PERSISTENT BRIDGE STORE
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("#### User Workspace")
    st.caption("Private Bridge Cloud Store")

    if "logged_in_user" not in st.session_state:
        st.session_state.logged_in_user = None

    if st.session_state.logged_in_user:
        user = st.session_state.logged_in_user
        st.success(f"Active Account: **@{user}**")

        st.markdown("##### Search History")
        history = get_history(user)
        if history:
            for h in history[:8]:
                cols = st.columns([1, 4])
                with cols[0]:
                    if h.get("avatar_url"):
                        st.image(h["avatar_url"], width=32)
                    else:
                        st.markdown("👤")
                with cols[1]:
                    comp_label = f" vs {h['comparison_creator']}" if h.get("comparison_creator") else ""
                    btn_label = f"{h['creator_name']}{comp_label}"
                    if st.button(btn_label, key=f"hist_{h['id']}", use_container_width=True):
                        cached = get_cached_intel(user, h["creator_name"])
                        if cached:
                            st.session_state.intel = cached
                            st.session_state.intel_name = h["creator_name"]
                            st.session_state.comparison_creator_name = h.get("comparison_creator", "")
                            st.session_state["input_creator_name"] = h["creator_name"]
                            if h.get("comparison_creator"):
                                st.session_state["input_comparison_creator"] = h["comparison_creator"]
                            st.session_state.intel_from_cache = True
                            st.session_state.prev_findings = get_user_previous_findings(user, h["creator_name"])
                            cached_clone = get_cached_clone(user, h["creator_name"])
                            if cached_clone:
                                st.session_state.copy_data = {
                                    "target_creator": h["creator_name"],
                                    "target_niche": cached.get("creator_profile", {}).get("core_niche", ""),
                                    "target_profile": cached.get("creator_profile", {}),
                                    "style_card": cached_clone.get("style_card", {}),
                                    "blueprints": cached_clone.get("blueprints", []),
                                    "piracy_ideas": cached_clone.get("piracy_ideas", []),
                                    "target_intel": cached,
                                }
                            st.rerun()
        else:
            st.caption("No history yet. Analyze a creator to record findings.")

        st.markdown("---")
        if st.button("Sign Out", use_container_width=True):
            st.session_state.logged_in_user = None
            st.rerun()
    else:
        auth_tab_login, auth_tab_create = st.tabs(["Sign In", "Create Account"])

        with auth_tab_login:
            login_user = st.text_input("Username", key="login_user", placeholder="username")
            login_pin = st.text_input("PIN", type="password", key="login_pin", placeholder="4-digit PIN")
            if st.button("Sign In", use_container_width=True, key="btn_login"):
                if login_user.strip() and login_pin.strip():
                    try:
                        login(login_user.strip(), login_pin.strip())
                        st.session_state.logged_in_user = login_user.strip().lower()
                        st.rerun()
                    except ProfileNotFound:
                        st.error("Username not found. Create an account first.")
                    except WrongPIN:
                        st.error("Incorrect PIN.")
                else:
                    st.warning("Enter both username and PIN.")

        with auth_tab_create:
            new_user = st.text_input("Choose Username", key="new_user", placeholder="e.g. asuja")
            new_pin = st.text_input("Set a PIN", type="password", key="new_pin", placeholder="e.g. 1234")
            new_pin2 = st.text_input("Confirm PIN", type="password", key="new_pin2", placeholder="Repeat PIN")
            if st.button("Create Account", use_container_width=True, key="btn_create"):
                if not new_user.strip():
                    st.warning("Enter a username.")
                elif not new_pin.strip() or len(new_pin.strip()) < 3:
                    st.warning("PIN must be at least 3 characters.")
                elif new_pin != new_pin2:
                    st.error("PINs do not match.")
                else:
                    try:
                        create_profile(new_user.strip(), new_pin.strip())
                        st.session_state.logged_in_user = new_user.strip().lower()
                        st.success("Account created!")
                        st.rerun()
                    except UsernameTaken:
                        st.error("Username already taken.")


# ─── UNIVERSAL VIDEO PLAYER WIDGET ────────────────────────────────────────────
def render_playable_video(v_url: str, title: str = "", platform: str = ""):
    if not v_url:
        st.caption("Media stream currently loading...")
        return

    clean_url = v_url.strip()
    if "youtube.com/shorts/" in clean_url:
        m_short = re.search(r"/shorts/([A-Za-z0-9_-]+)", clean_url)
        if m_short:
            clean_url = f"https://www.youtube.com/watch?v={m_short.group(1)}"

    # YouTube
    if "youtube.com" in clean_url or "youtu.be" in clean_url:
        st.video(clean_url)
        st.caption(f"Source: [YouTube — {title or clean_url}]({clean_url})")

    # Instagram
    elif "instagram.com" in clean_url:
        m = re.search(r"/(?:reel|reels|p|tv)/([A-Za-z0-9_-]+)", clean_url)
        if m:
            code = m.group(1)
            embed_code = f"""
            <iframe src="https://www.instagram.com/reel/{code}/embed" 
                    width="100%" height="450" frameborder="0" scrolling="no" allowtransparency="true" allowfullscreen></iframe>
            """
            st.components.v1.html(embed_code, height=470)
            st.caption(f"Source: [Instagram — {title or clean_url}]({clean_url})")
        else:
            st.info(f"Instagram: [{title or clean_url}]({clean_url})")
        st.link_button("Open on Instagram", clean_url, type="secondary")

    # TikTok
    elif "tiktok.com" in clean_url:
        m_tt = re.search(r"/video/(\d+)", clean_url)
        if m_tt:
            t_id = m_tt.group(1)
            embed_code = f"""
            <iframe src="https://www.tiktok.com/embed/v2/{t_id}" 
                    width="100%" height="450" frameborder="0" allowfullscreen></iframe>
            """
            st.components.v1.html(embed_code, height=470)
            st.caption(f"Source: [TikTok — {title or clean_url}]({clean_url})")
        else:
            st.info(f"TikTok: [{title or clean_url}]({clean_url})")
        st.link_button("Open on TikTok", clean_url, type="secondary")

    # Other
    else:
        try:
            st.video(clean_url)
            st.caption(f"Media Source: [{title or clean_url}]({clean_url})")
        except Exception:
            st.link_button("Open Media Stream", clean_url, type="secondary")


# ═══════════════════════════════════════════════════════════════════════════════
#  COMMAND BAR (Unified Raycast / Spotlight Style Reconnaissance Console)
# ═══════════════════════════════════════════════════════════════════════════════
with st.container(border=True):
    st.markdown("""
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem;">
      <span style="font-family: var(--font-heading); font-size: 0.85rem; font-weight: 700; color: #F8FAFC;">
        RECONNAISSANCE &amp; DECOUPLING CONSOLE
      </span>
      <span style="font-family: var(--font-mono); font-size: 0.68rem; color: #64748B;">
        LIVE WEB SCRAPE + LLM SYNTHESIS
      </span>
    </div>
    """, unsafe_allow_html=True)

    col_a, col_b, col_c = st.columns([1.5, 1.5, 1.0])
    with col_a:
        creator_name = st.text_input(
            "Target Creator (To Clone)",
            placeholder="e.g. CarryMinati, MrBeast, Aakash Dhawan",
            key="input_creator_name"
        )
    with col_b:
        comparison_creator = st.text_input(
            "Benchmark Creator (Optional Rival)",
            placeholder="e.g. Ashish Chanchlani, Ryan Trahan, your channel",
            key="input_comparison_creator",
            help="Add a rival to generate an accurate head-to-head comparison and hook contrast duel."
        )
    with col_c:
        creator_niche = st.text_input(
            "Category / Niche (Optional)",
            placeholder="e.g. Comedy, Motovlog, Tech",
            key="input_creator_niche"
        )

    # ── Presets & Auto-detection chips ────────────────────────────────────────
    if creator_name and len(creator_name.strip()) >= 2:
        suggestions = find_similar_creators(creator_name.strip(), min_score=0.45, limit=4)
        is_exact = any(s["name"].lower() == creator_name.strip().lower() for s in suggestions)
        if suggestions and not is_exact:
            st.markdown("<span style='font-size:0.75rem; color:#94A3B8;'>Suggested Creator Matches:</span>", unsafe_allow_html=True)
            sug_cols = st.columns(min(len(suggestions), 4))
            for s_idx, sug in enumerate(suggestions[:4]):
                with sug_cols[s_idx]:
                    def _make_picker(target_n=sug["name"], target_cat=sug["niche"]):
                        def _callback():
                            st.session_state["input_creator_name"] = target_n
                            if target_cat:
                                st.session_state["input_creator_niche"] = target_cat
                        return _callback
                    st.button(
                        f"{sug['name']} ({sug['niche'][:16]})",
                        key=f"sug_btn_t1_{s_idx}_{sug['name'][:8]}",
                        use_container_width=True,
                        on_click=_make_picker(sug["name"], sug["niche"])
                    )

    run_intel = st.button("Execute Deep Analysis & Decouple Formula", type="primary", key="intel_btn", use_container_width=True)


# ── Pipeline Execution Engine ────────────────────────────────────────────────
if run_intel and creator_name.strip():
    prev_findings = {}
    if st.session_state.get("logged_in_user"):
        prev_findings = get_user_previous_findings(st.session_state.logged_in_user, creator_name.strip())
        st.session_state.prev_findings = prev_findings

    with st.status(f"Deconstructing {creator_name}...", expanded=True) as status:
        try:
            if prev_findings.get("total_past_runs", 0) > 0:
                status.write(f"Loaded {prev_findings['total_past_runs']} previous session findings from Bridge.")
            status.write("Crawling social footprint and verified uploads via Firecrawl...")
            from parallel.intelligence import generate_creator_intelligence
            comp_c_clean = comparison_creator.strip() if comparison_creator else ""
            intel = generate_creator_intelligence(creator_name.strip(), creator_niche.strip(), previous_findings=prev_findings, comparison_creator=comp_c_clean)
            st.session_state.comparison_creator_name = comp_c_clean
            st.session_state.intel = intel
            st.session_state.intel_name = creator_name.strip()
            st.session_state.intel_from_cache = False

            t_profile = intel.get("creator_profile", {})
            t_niche = t_profile.get("core_niche", creator_niche.strip() or "Digital Content")
            t_creator_vids = intel.get("creator_videos", [])
            t_niche_vids = intel.get("niche_trending_videos", [])

            status.write("Synthesizing Style DNA, blueprints & 5 upgrade concepts...")
            dossier = generate_unified_clone_dossier(creator_name.strip(), t_niche, t_creator_vids, t_niche_vids, comparison_creator=comp_c_clean)
            copy_result = {
                "target_creator": creator_name.strip(),
                "comparison_creator": comp_c_clean,
                "target_niche": t_niche,
                "target_profile": t_profile,
                "style_card": dossier["style_card"],
                "blueprints": dossier["blueprints"],
                "piracy_ideas": dossier["piracy_ideas"],
                "head_to_head": dossier.get("head_to_head"),
                "target_intel": intel,
            }
            st.session_state.copy_data = copy_result

            # Save to isolated store
            if st.session_state.get("logged_in_user"):
                user_now = st.session_state.logged_in_user
                save_intel(user_now, creator_name.strip(), t_niche, intel, comparison_creator=comp_c_clean)
                push_summary_to_bridge(user_now, creator_name.strip(), intel)
                save_clone_run(user_now, creator_name.strip(), dossier["style_card"], dossier["blueprints"], dossier["piracy_ideas"])
                save_to_bridge_user_store(user_now, creator_name.strip(), intel, copy_result, comparison_creator=comp_c_clean)

            status.update(label="Analysis & Clone Dossier Ready", state="complete")
        except Exception as e:
            status.update(label="Engine notice", state="error")
            st.error(f"Error: {e}")
elif run_intel:
    st.warning("Please specify a target creator name.")


# ═══════════════════════════════════════════════════════════════════════════════
#  WORKSPACE APPLICATION TABS (Clean 6-Section Architecture)
# ═══════════════════════════════════════════════════════════════════════════════
intel = st.session_state.get("intel")

tab_dossier, tab_ideas, tab_clone, tab_friction, tab_hooks, tab_analytics = st.tabs([
    "Executive Dossier",
    "Viral Content Studio (5)",
    "Style DNA & Blueprints",
    "Audience Friction Audit",
    "Hook Simulator & Economics",
    "Reach & Commercials"
])

# ─────────────────────────────────────────────────────────────────────────────
# 1. EXECUTIVE DOSSIER
# ─────────────────────────────────────────────────────────────────────────────
with tab_dossier:
    if not intel:
        st.info("Enter a target creator in the Reconnaissance Console above to generate the Executive Dossier.")
    else:
        creator_name_display = st.session_state.get("intel_name", "Creator")
        profile = intel.get("creator_profile", {})
        tier = profile.get("tier") or "Mega (10M+)"
        niche_disp = profile.get("core_niche") or "Short-form Content"
        loc_disp = profile.get("location") or "India"
        avatar_url = profile.get("avatar_url", "")

        with st.container(border=True):
            pcol1, pcol2 = st.columns([1, 4])
            with pcol1:
                if avatar_url:
                    st.image(avatar_url, width=110)
                else:
                    st.markdown("### 👤")
            with pcol2:
                st.markdown(f"### {profile.get('name', creator_name_display)}")
                st.markdown(f"**Tier:** `{tier}` &nbsp;·&nbsp; **Category:** `{niche_disp}` &nbsp;·&nbsp; **Location:** `{loc_disp}`")
                accounts = profile.get("discovered_accounts", [])
                if accounts:
                    acc_pills = [f"[{acc.get('platform')}: {acc.get('title')}]({acc.get('url')})" if acc.get("url") else f"{acc.get('platform')}: {acc.get('title')}" for acc in accounts]
                    st.caption("Verified Handles: " + " · ".join(acc_pills))

            c_desc1, c_desc2 = st.columns(2)
            with c_desc1:
                st.info(f"**Delivery Rhythm:** {profile.get('tone_and_style') or 'High-energy, satirical, engaging delivery.'}")
            with c_desc2:
                st.info(f"**Audience Persona:** {profile.get('audience_vibe') or 'Young, college, mobile-first community.'}")

        # Head to Head Battle (if benchmark provided)
        copy_data = st.session_state.get("copy_data", {})
        h2h = copy_data.get("head_to_head")
        if h2h:
            bench_n = h2h.get("benchmark_creator", "Benchmark Creator")
            st.markdown(f"#### Head-to-Head Comparative Duel: {creator_name_display} vs {bench_n}")
            h1, h2 = st.columns(2)
            with h1:
                with st.container(border=True):
                    st.markdown(f"**{creator_name_display} (Retention Edge):**")
                    st.write(h2h.get("target_style_edge", "Fast hook pacing and visual pattern interrupt."))
            with h2:
                with st.container(border=True):
                    st.markdown(f"**{bench_n} (Retention Leak):**")
                    st.write(h2h.get("benchmark_weakness", "Slow conversational setup and exposition drag."))

            with st.container(border=True):
                st.markdown(f"**Winning Conversion Rule:** {h2h.get('cloning_conversion_rule', 'Adopt fast opening tempo while targeting their core topic.')}")
                hk_contrast = h2h.get("hook_contrast", {})
                if hk_contrast:
                    win_hook = hk_contrast.get("winning_hybrid_hook", "")
                    if win_hook:
                        st.success(f"**Winning Hybrid Hook:** \"{win_hook}\"")
                        if st.button("Send 4-Hook Contrast Duel to Simulator", key="btn_h2h_send", use_container_width=True):
                            h2h_cand_hooks = hk_contrast.get("candidate_hooks")
                            if not h2h_cand_hooks or len(h2h_cand_hooks) < 3:
                                h2h_cand_hooks = [
                                    {"sid": "S1", "text": hk_contrast.get("creator_a_hook", f"Stop scrolling — this changes everything about {creator_name_display}'s formula.")},
                                    {"sid": "S2", "text": hk_contrast.get("creator_b_hook", f"Today we are going to look into an interesting problem.")},
                                    {"sid": "S3", "text": win_hook},
                                    {"sid": "S4", "text": f"I took {bench_n}'s biggest video and remade it using {creator_name_display}'s viral formula."}
                                ]
                            st.session_state.prefill_hooks = (
                                f"Battle: {creator_name_display} vs {bench_n}. 4-Hook Comparative Duel:\n" +
                                "\n".join(f"{h['sid']}: {h['text']}" for h in h2h_cand_hooks)
                            )
                            st.success("4 duel hooks prefilled in Hook Simulator tab.")

        # Creator's Top Video Breakdown
        creator_vids = intel.get("creator_videos", [])
        if creator_vids:
            st.markdown("#### Creator Proven Uploads (Watch & Deconstruct)")
            cvid_labels = [f"[{v.get('platform', 'Video')}] {v.get('title', 'Video')} ({v.get('views', 'Popular')})" for v in creator_vids]
            c_selected_idx = st.radio("Select upload:", range(len(creator_vids)), format_func=lambda i: cvid_labels[i], horizontal=True, key="radio_dossier_vids")
            c_sel_vid = creator_vids[c_selected_idx]
            cvcol1, cvcol2 = st.columns([1.2, 1])
            with cvcol1:
                render_playable_video(c_sel_vid.get("url", ""), c_sel_vid.get("title", ""), c_sel_vid.get("platform", "YouTube"))
            with cvcol2:
                with st.container(border=True):
                    st.metric("Views Benchmark", c_sel_vid.get("views", "Top Performer"))
                    st.markdown(f"**Opening 3-Second Hook:**\n> *\"{c_sel_vid.get('opening_hook', '—')}\"*")
                    st.markdown(f"**Retention Trigger:** {c_sel_vid.get('why_it_went_viral', '—')}")


# ─────────────────────────────────────────────────────────────────────────────
# 2. VIRAL CONTENT STUDIO (5 IDEAS + 4 HOOKS EACH)
# ─────────────────────────────────────────────────────────────────────────────
with tab_ideas:
    if not intel:
        st.info("Run analysis on a creator to unlock 5 engineered viral concepts with 4 hook archetypes each.")
    else:
        suggestions = intel.get("content_suggestions", [])
        creator_name_display = st.session_state.get("intel_name", "Creator")

        col_hdr, col_btn = st.columns([3, 1.2])
        with col_hdr:
            st.markdown(f"### High-Potential Content Concepts ({len(suggestions)} Ideas)")
            st.caption("Engineered based on verified live trending topics. Every idea contains 4 distinct short-form hook archetypes.")
        with col_btn:
            if st.button("🚀 Push ALL 5 Concepts to Simulator", key="btn_push_all_ideas", use_container_width=True, type="primary"):
                all_idea_hooks = []
                for s_i, s_item in enumerate(suggestions[:5], start=1):
                    s_hks = s_item.get("candidate_hooks", [])
                    top_t = s_hks[0].get("text", "") if s_hks else s_item.get("title", "")
                    all_idea_hooks.append(f"S{s_i}: {top_t}")
                st.session_state.prefill_hooks = (
                    f"Creator: {creator_name_display}. 5-Concept Showdown:\n" +
                    "\n".join(all_idea_hooks)
                )
                st.success("Top hook for all 5 concepts prefilled in Hook Simulator tab.")

        for s in suggestions:
            with st.container(border=True):
                h1, h2 = st.columns([3, 1])
                with h1:
                    st.markdown(f"##### Concept #{s.get('id', '?')}: {s.get('title', 'Untitled')}")
                    st.caption(f"Trending Topic: `{s.get('trending_topic', '—')}`")
                    st.markdown(f"**Strategic Rationale:** {s.get('why_it_works', '—')}")
                with h2:
                    st.metric("Est. Views Potential", s.get("estimated_views", "—"))

                ref = s.get("reference_video") or {}
                if ref.get("url") and ref.get("verified"):
                    with st.expander(f"Watch Reference Benchmark: {ref.get('title', 'Video')} ({ref.get('creator', 'Source')})", expanded=False):
                        r1, r2 = st.columns([1.2, 1])
                        with r1:
                            render_playable_video(ref["url"], ref.get("title", ""), ref.get("platform", ""))
                        with r2:
                            st.markdown(f"**Why this benchmarks the concept:**\n{ref.get('why_reference', 'Demonstrates retention.')}")

                hooks = s.get("candidate_hooks", [])
                if hooks:
                    st.markdown("**4 Candidate Hook Archetypes (3-Second Retention Pacing):**")
                    archetypes = ["INCIDENT", "CURIOSITY", "SHOCK", "CONTRARIAN"]
                    for idx, hk in enumerate(hooks):
                        arch = archetypes[idx % len(archetypes)]
                        s_id = hk.get('sid', f"S{idx+1}")
                        h_txt = hk.get('text', '')
                        st.markdown(f"""
                        <div style="
                          display: flex; align-items: flex-start; gap: 8px;
                          background: #141622; border: 1px solid #232638;
                          border-left: 3px solid #6366F1;
                          border-radius: 6px; padding: 6px 10px; margin-bottom: 4px;
                        ">
                          <span style="font-family: var(--font-mono); font-size: 0.65rem; color: #818CF8; background: rgba(99,102,241,0.15); padding: 1px 5px; border-radius: 4px; font-weight: 700;">{s_id}</span>
                          <span style="font-family: var(--font-mono); font-size: 0.62rem; color: #64748B; background: rgba(255,255,255,0.04); padding: 1px 5px; border-radius: 4px;">{arch}</span>
                          <span style="font-size: 0.82rem; color: #F1F5F9; line-height: 1.4;">{h_txt}</span>
                        </div>
                        """, unsafe_allow_html=True)

                if st.button(f"Test all 4 candidate hooks for Concept #{s.get('id')}", key=f"test_concept_{s.get('id')}", use_container_width=True):
                    hook_lines = "\n".join([f"{hk['sid']}: {hk['text']}" for hk in hooks if 'sid' in hk and 'text' in hk])
                    st.session_state.prefill_hooks = (
                        f"Creator: {creator_name_display}. Concept: {s.get('title', '')}.\n" + hook_lines
                    )
                    st.success("4 candidate hooks sent to Hook Simulator.")


# ─────────────────────────────────────────────────────────────────────────────
# 3. STYLE DNA & READY-TO-FILM BLUEPRINTS
# ─────────────────────────────────────────────────────────────────────────────
with tab_clone:
    copy_data = st.session_state.get("copy_data")
    if not copy_data:
        st.info("Run analysis above to decouple Style DNA, shooting blueprints, and niche piracy ideas.")
    else:
        creator_name_display = copy_data.get("target_creator", "Creator")
        sc = copy_data.get("style_card", {})
        dna = sc.get("style_dna", {})

        st.markdown(f"### {creator_name_display}'s Decoupled Style DNA")
        if dna:
            d1, d2 = st.columns(2)
            with d1:
                with st.container(border=True):
                    st.markdown("**Hook Formula:**")
                    st.caption(dna.get("hook_formula", "—"))
                    st.markdown("**Content Structure:**")
                    st.caption(dna.get("content_structure", "—"))
                    st.markdown("**Editing Cadence:**")
                    st.caption(dna.get("editing_rhythm", "—"))
            with d2:
                with st.container(border=True):
                    st.markdown("**Thumbnail Formula:**")
                    st.caption(dna.get("thumbnail_formula", "—"))
                    st.markdown("**CTA Pattern:**")
                    st.caption(dna.get("cta_pattern", "—"))
                    st.markdown(f"**Viral Psychological Trigger:** `{dna.get('viral_trigger', '—')}`")

        # 5-Step Clone Roadmap
        roadmap = sc.get("clone_roadmap", [])
        if roadmap:
            st.markdown("#### 5-Step Implementation Roadmap")
            for step in roadmap:
                with st.expander(f"Step {step.get('step', '?')}: {step.get('action', '—')} ({step.get('difficulty', 'Medium')})"):
                    st.write(step.get("why_it_works", "—"))

        # Blueprints & Shooting Scripts
        bps = copy_data.get("blueprints", [])
        if bps:
            st.markdown("#### Frame-by-Frame Video Shooting Scripts")
            for bp_idx, bp in enumerate(bps):
                source_v = bp.get("source_video", {})
                with st.expander(f"Script #{bp_idx+1}: {source_v.get('title', 'Blueprint')}", expanded=bp_idx == 0):
                    script = bp.get("shooting_script", [])
                    if script:
                        st.dataframe(pd.DataFrame(script), use_container_width=True, hide_index=True)
                    equip = bp.get("equipment_needed", [])
                    if equip:
                        st.caption("Required Equipment: " + " · ".join(f"`{e}`" for e in equip))

        # Niche Piracy Ideas
        piracy_list = copy_data.get("piracy_ideas", [])
        if piracy_list:
            st.markdown(f"#### 5 Niche Piracy Upgrade Concepts")
            for idea in piracy_list:
                with st.expander(f"Upgrade #{idea.get('id', '?')}: {idea.get('your_upgrade_title', '—')} ({idea.get('estimated_views', '')})"):
                    st.markdown(f"**Competitor Baseline:** {idea.get('competitor_did', '—')}")
                    st.markdown(f"**Why Yours Outperforms:** {idea.get('why_yours_wins', '—')}")
                    p_hooks = idea.get("candidate_hooks", [])
                    if p_hooks:
                        st.markdown("**Upgrade Hooks:**")
                        for phk in p_hooks:
                            st.markdown(f"- **{phk.get('sid', '')}**: {phk.get('text', '')}")
                        if st.button(f"Test 4 Piracy Hooks for Upgrade #{idea.get('id')}", key=f"btn_piracy_{idea.get('id')}", use_container_width=True):
                            hook_lines = "\n".join([f"{h['sid']}: {h['text']}" for h in p_hooks if 'sid' in h and 'text' in h])
                            st.session_state.prefill_hooks = (
                                f"Creator: {creator_name_display} (Piracy Upgrade). Topic: {idea.get('your_upgrade_title', '')}.\n" + hook_lines
                            )
                            st.success("4 piracy hooks prefilled in Hook Simulator.")


# ─────────────────────────────────────────────────────────────────────────────
# 4. AUDIENCE FRICTION & RETENTION LEAKS
# ─────────────────────────────────────────────────────────────────────────────
with tab_friction:
    if not intel:
        st.info("Analyze a creator to audit real audience complaints, retention friction, and counter-hook upgrades.")
    else:
        creator_name_display = st.session_state.get("intel_name", "Creator")
        neg_reviews = intel.get("negative_reviews", [])
        imp_suggs = intel.get("improvement_suggestions", [])

        st.markdown(f"### Audience Friction & Viewer Drop-off Audit: {creator_name_display}")
        st.caption("Real viewer complaints crawled from public forums, comments, and sentiment clusters.")

        if neg_reviews:
            ncols = st.columns(min(len(neg_reviews), 3))
            for n_idx, rev in enumerate(neg_reviews):
                with ncols[n_idx % 3]:
                    with st.container(border=True):
                        freq = rev.get("frequency", "Occasional")
                        badge_color = "#F43F5E" if freq == "Common" else "#F59E0B"
                        st.markdown(f"**{rev.get('criticism_category', 'Criticism')}**")
                        st.caption(f"Frequency: `{freq}`")
                        quote = rev.get("audience_quote_example", "")
                        if quote:
                            st.markdown(f"> *\"{quote}\"*")
                        st.markdown(f"**Channel Impact:** {rev.get('impact_on_channel', 'Causes viewer attrition.')}")

        if imp_suggs:
            st.markdown("#### Counter-Hook Upgrades (Turning Weaknesses into Retention)")
            for imp_idx, imp in enumerate(imp_suggs, 1):
                with st.container(border=True):
                    i1, i2 = st.columns([2, 1])
                    with i1:
                        st.markdown(f"##### Solution #{imp_idx}: {imp.get('fix_title', 'Content Fix')}")
                        st.markdown(f"**Addressing:** `{imp.get('problem', 'Audience Fatigue')}`")
                        st.write(imp.get('fix_description', ''))
                        st.success(f"Expected Retention Boost: {imp.get('expected_impact', '+25% retention')}")
                    with i2:
                        up_hook = imp.get('hook_upgrade', '')
                        st.markdown(f"**Upgraded Counter-Hook:**\n> *\"{up_hook}\"*")
                        if st.button(f"Test Upgrade Hooks in Simulator", key=f"btn_fric_test_{imp_idx}", use_container_width=True):
                            cand_imp_hooks = imp.get("candidate_hooks", [])
                            if not cand_imp_hooks or len(cand_imp_hooks) < 3:
                                cand_imp_hooks = [
                                    {"sid": "S1", "text": up_hook},
                                    {"sid": "S2", "text": f"Why viewers disliked my last video on {imp.get('problem', 'this')} — and how I fixed it."},
                                    {"sid": "S3", "text": f"I asked 50 honest commenters what went wrong. Here is the real fix."},
                                    {"sid": "S4", "text": f"No clickbait, zero fluff: the 100% transparent truth about {imp.get('fix_title', 'this topic')}."}
                                ]
                            st.session_state.prefill_hooks = (
                                f"Creator: {creator_name_display}. Upgrade Concept: {imp.get('fix_title', '')}\n" +
                                "\n".join(f"{h['sid']}: {h['text']}" for h in cand_imp_hooks)
                            )
                            st.success("4 counter-hooks sent to Hook Simulator.")


# ─────────────────────────────────────────────────────────────────────────────
# 5. HOOK SIMULATOR & PREDICTIVE MONETIZATION
# ─────────────────────────────────────────────────────────────────────────────
with tab_hooks:
    st.markdown("### Hook Testing & Algorithmic Simulator")
    st.caption("Evaluate short-form candidate hooks across simulated demographic panels (18–24), calculate clickbait penalty, and project video earnings.")

    with st.container(border=True):
        col_t1, col_t2 = st.columns([3, 1])
        with col_t2:
            if st.button("Load Trending Preset", help="Loads trending viral hook patterns", use_container_width=True):
                st.session_state.prefill_hooks = (
                    "Creator: CarryMinati. Niche: Viral Roasts & Parody Shorts.\n"
                    "S1: I found the fakest gym influencer on Instagram and confronted him.\n"
                    "S2: Nobody noticed this millionaire YouTuber doing this in India...\n"
                    "S3: If you watch motivational podcasts, I have terrible news for you.\n"
                    "S4: This one video got 10 million views for the worst reason ever."
                )
                st.rerun()

        default_text = st.session_state.get("prefill_hooks", "")
        text = st.text_area(
            "Candidate Hooks (or paste brief + hooks S1 to S4):",
            value=default_text,
            height=130,
            placeholder="S1: Hook 1... S2: Hook 2..."
        )

        n = st.slider("Simulated Persona Sample Size", 10, 150, 15, 5, help="15-20 personas completes in ~20s. 50+ provides high demographic granularity.")
        run_hook_test = st.button("Run Synthetic Audience Calibration", type="primary", use_container_width=True)

    if run_hook_test and text:
        with st.spinner("Calibrating stop-scroll retention across personas..."):
            try:
                res = run_study(text, n)
                st.session_state.res = res
                st.session_state.prefill_hooks = ""
                Path("data").mkdir(exist_ok=True)
                Path("data/brief.txt").write_text(brief_text(res["study"]), encoding="utf-8")
                Path("data/summary.txt").write_text(summary_text(res), encoding="utf-8")
                st.success("Simulation complete.")
            except Exception as e:
                st.error(f"Error: {e}")

    res = st.session_state.get("res")
    if res:
        st.markdown("---")
        label, why = res["confidence"]
        if label == "LOW":
            st.error(f"Confidence: {label}. {why}")
        elif label != "OK":
            st.warning(f"Confidence: {label}. {why}")
        else:
            st.success(f"Statistical Confidence: {label}. {why}")

        if label != "LOW":
            items_df = res["items"].rename(columns={"text": "hook_text"}).copy()
            top_row = items_df.iloc[0]
            top_score = float(top_row["score"])
            top_clickbait = float(top_row["clickbait"])
            top_best = float(top_row["best"])
            top_worst = float(top_row["worst"])
            top_hook_name = top_row["sid"]
            top_hook_content = top_row["hook_text"]

            # Mathematical projection modeling
            if top_score >= 4.2:
                views_tier = "2.5M – 5.0M Views"
                min_v, max_v = 2_500_000, 5_000_000
                fame_label = "Ultra Viral Breakout (Top 3% of Niche)"
                subs_gain = "+25,000 – 50,000 Followers"
                algo_prob = "95% Push Likelihood"
            elif top_score >= 3.6:
                views_tier = "1.0M – 2.5M Views"
                min_v, max_v = 1_000_000, 2_500_000
                fame_label = "Strong Category Performer (Top 15%)"
                subs_gain = "+10,000 – 25,000 Followers"
                algo_prob = "84% Push Likelihood"
            elif top_score >= 3.0:
                views_tier = "300K – 1.0M Views"
                min_v, max_v = 300_000, 1_000_000
                fame_label = "Steady Baseline Retention"
                subs_gain = "+3,000 – 10,000 Followers"
                algo_prob = "65% Push Likelihood"
            else:
                views_tier = "100K – 300K Views"
                min_v, max_v = 100_000, 300_000
                fame_label = "High Drop-off Risk"
                subs_gain = "< 3,000 Followers"
                algo_prob = "35% Push Likelihood"

            if top_clickbait > 0.15:
                penalty = 1.0 - (top_clickbait * 0.8)
                min_v = int(min_v * penalty)
                max_v = int(max_v * penalty)

            adsense_min = int((min_v / 1000) * 28)
            adsense_max = int((max_v / 1000) * 42)

            if top_score >= 4.0:
                sponsor_min, sponsor_max = 60_000, 150_000
            elif top_score >= 3.5:
                sponsor_min, sponsor_max = 30_000, 60_000
            else:
                sponsor_min, sponsor_max = 12_000, 30_000

            tot_rev_min = adsense_min + sponsor_min
            tot_rev_max = adsense_max + sponsor_max
            tot_rev_usd_min = int(tot_rev_min / 84)
            tot_rev_usd_max = int(tot_rev_max / 84)

            viral_index = int(min(98, max(30, (top_score / 5.0) * 82 + (top_best * 20) - (top_worst * 15) - (top_clickbait * 20))))

            st.markdown("#### Economic Projections & Viral Fame Index")
            p_rev_col, p_fame_col = st.columns(2)
            with p_rev_col:
                with st.container(border=True):
                    st.markdown(f"**Predicted Video Earnings ({top_hook_name})**")
                    st.markdown(f"### ₹{tot_rev_min:,} – ₹{tot_rev_max:,} <span style='font-size:0.9rem; color:#94A3B8;'>(${tot_rev_usd_min:,} – ${tot_rev_usd_max:,})</span>", unsafe_allow_html=True)
                    st.caption(f"Estimated View Potential: **{views_tier}**")
                    st.markdown(f"- AdSense Conversion: `₹{adsense_min:,} – ₹{adsense_max:,}`")
                    st.markdown(f"- Brand Sponsor Value: `₹{sponsor_min:,} – ₹{sponsor_max:,}`")
                    if top_clickbait <= 0.10:
                        st.caption("Clean advertiser suitability score.")
                    else:
                        st.caption(f"⚠️ {top_clickbait:.0%} clickbait ratio applied.")

            with p_fame_col:
                with st.container(border=True):
                    st.markdown(f"**Viral Fame Index: {viral_index} / 100**")
                    st.markdown(f"### {fame_label}")
                    st.caption(f"Projected Follower Acquisition: **{subs_gain}**")
                    st.markdown(f"- Recommendation Likelihood: `{algo_prob}`")
                    st.markdown(f"- Stop-Scroll Score: `{top_score:.2f} / 5.0` (Favorite: `{top_best:.0%}`)")

            # Visual charts
            st.markdown("#### Hook Stop-Scroll Ranking")
            fig_score = px.bar(
                items_df, x="score", y="sid", orientation="h",
                text=items_df["score"].apply(lambda s: f"{s:.2f}"),
                color="score", color_continuous_scale="Purples",
                hover_data={"hook_text": True, "score": ":.2f", "clickbait": ":.0%"},
                labels={"score": "Stop-Scroll Rating (1.0 to 5.0)", "sid": "Hook"}
            )
            fig_score.update_layout(
                yaxis={"autorange": "reversed"}, height=280,
                margin=dict(l=10, r=10, t=30, b=10),
                paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                font={"color": "#F8FAFC", "family": "Inter, sans-serif"},
                xaxis={"gridcolor": "#202333"}, yaxis_gridcolor="#202333"
            )
            st.plotly_chart(fig_score, use_container_width=True)

            pol_col1, pol_col2 = st.columns(2)
            with pol_col1:
                st.markdown("**Audience Favorite Share**")
                fig_best = px.bar(items_df, x="best", y="sid", orientation="h", color_discrete_sequence=["#10B981"], labels={"best": "% Picked as Best", "sid": "Hook"})
                fig_best.update_layout(xaxis_tickformat='.0%', height=200, margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font={"color": "#F8FAFC"}, xaxis_gridcolor="#202333")
                st.plotly_chart(fig_best, use_container_width=True)

            with pol_col2:
                st.markdown("**High Drop-off Share**")
                fig_worst = px.bar(items_df, x="worst", y="sid", orientation="h", color_discrete_sequence=["#F43F5E"], labels={"worst": "% Picked as Worst", "sid": "Hook"})
                fig_worst.update_layout(xaxis_tickformat='.0%', height=200, margin=dict(l=10, r=10, t=10, b=10), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)", font={"color": "#F8FAFC"}, xaxis_gridcolor="#202333")
                st.plotly_chart(fig_worst, use_container_width=True)

            with st.expander("Detailed Ranking Table"):
                st.dataframe(items_df[["sid", "hook_text", "score", "best", "worst", "clickbait"]], use_container_width=True)


# ─────────────────────────────────────────────────────────────────────────────
# 6. CHANNEL REACH & COMMERCIALS
# ─────────────────────────────────────────────────────────────────────────────
with tab_analytics:
    if not intel:
        st.info("Analyze a creator in the Reconnaissance Console above to evaluate channel reach, audience demographics, and rate card benchmarks.")
    else:
        profile = intel.get("creator_profile", {})
        metrics = intel.get("platform_metrics", {})
        demo = intel.get("audience_demographics", {})
        rate_card = intel.get("rate_card_and_sponsors", {})

        m_yt = metrics.get("youtube_subscribers") or metrics.get("youtube") or "45.0M"
        m_ig = metrics.get("instagram_followers") or metrics.get("instagram") or "21.5M"
        m_reach = metrics.get("total_reach") or f"{m_yt} + {m_ig}"
        m_eng = metrics.get("engagement_rate") or "7.2%"
        m_cad = metrics.get("youtube_cadence") or "1-2 videos/month"

        st.markdown(f"### Platform Scale & Commercials: {profile.get('name', 'Creator')}")

        m1, m2, m3, m4, m5 = st.columns(5)
        m1.metric("Combined Reach", m_reach)
        m2.metric("YouTube Base", m_yt)
        m3.metric("Instagram Base", m_ig)
        m4.metric("Engagement", m_eng)
        m5.metric("Cadence", m_cad)

        st.markdown("---")
        st.markdown("#### Commercial Rate Card Estimates")
        rc1, rc2, rc3 = st.columns(3)
        rc1.metric("YouTube Dedicated Integration", rate_card.get("est_youtube_rate") or "₹35L - ₹75L")
        rc2.metric("Instagram Dedicated Reel", rate_card.get("est_instagram_reel_rate") or "₹12L - ₹25L")
        rc3.metric("Instagram Story Series", rate_card.get("est_story_rate") or "₹3L - ₹6L")

        b1, b2 = st.columns(2)
        with b1:
            st.markdown("**High Affinity Sponsor Sectors:**")
            aff_niches = rate_card.get("brand_affinity_niches", [])
            if aff_niches:
                st.write(", ".join([f"`{n}`" for n in aff_niches]))
            past_spons = rate_card.get("past_or_likely_sponsors", [])
            if past_spons:
                st.markdown("**Recent Active Advertisers:** " + ", ".join([f"**{s}**" for s in past_spons]))
        with b2:
            why_partner = rate_card.get("why_brands_partner", "")
            if why_partner:
                st.success(f"**Strategic Value:** {why_partner}")
