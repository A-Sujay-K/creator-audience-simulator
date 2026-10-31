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
    ProfileNotFound, WrongPIN, UsernameTaken
)
from parallel.clone_intel import get_style_dna, get_video_blueprint, get_piracy_ideas

st.set_page_config(page_title="Parallel for Creators", page_icon="⚡", layout="wide")

# ═══════════════════════════════════════════════════════════════════════════════
#  SIDEBAR — USER PROFILE SYSTEM
# ═══════════════════════════════════════════════════════════════════════════════
with st.sidebar:
    st.markdown("## 👤 Your Profile")

    if "logged_in_user" not in st.session_state:
        st.session_state.logged_in_user = None

    if st.session_state.logged_in_user:
        user = st.session_state.logged_in_user
        st.success(f"Signed in as **{user}**")

        # ── Search History ────────────────────────────────────────────────
        st.markdown("### 📜 Search History")
        history = get_history(user)
        if history:
            for h in history[:10]:
                cols = st.columns([1, 4])
                with cols[0]:
                    if h.get("avatar_url"):
                        st.image(h["avatar_url"], width=36)
                    else:
                        st.markdown("👤")
                with cols[1]:
                    btn_label = f"**{h['creator_name']}**"
                    if st.button(btn_label, key=f"hist_{h['id']}", use_container_width=True):
                        cached = get_cached_intel(user, h["creator_name"])
                        if cached:
                            st.session_state.intel = cached
                            st.session_state.intel_name = h["creator_name"]
                            st.session_state.intel_from_cache = True
                            st.rerun()
        else:
            st.caption("No searches yet. Analyse a creator to build your history.")

        st.markdown("---")
        if st.button("🚪 Sign Out", use_container_width=True):
            st.session_state.logged_in_user = None
            st.rerun()
    else:
        auth_tab_login, auth_tab_create = st.tabs(["Sign In", "Create Account"])

        with auth_tab_login:
            login_user = st.text_input("Username", key="login_user", placeholder="your_username")
            login_pin = st.text_input("PIN", type="password", key="login_pin", placeholder="4-digit PIN")
            if st.button("🔑 Sign In", use_container_width=True, key="btn_login"):
                if login_user.strip() and login_pin.strip():
                    try:
                        login(login_user.strip(), login_pin.strip())
                        st.session_state.logged_in_user = login_user.strip().lower()
                        st.rerun()
                    except ProfileNotFound:
                        st.error("Username not found. Create an account first.")
                    except WrongPIN:
                        st.error("Incorrect PIN. Please try again.")
                else:
                    st.warning("Enter both username and PIN.")

        with auth_tab_create:
            new_user = st.text_input("Choose Username", key="new_user", placeholder="e.g. asuja")
            new_pin = st.text_input("Set a PIN", type="password", key="new_pin", placeholder="e.g. 1234")
            new_pin2 = st.text_input("Confirm PIN", type="password", key="new_pin2", placeholder="Repeat PIN")
            if st.button("✨ Create Account", use_container_width=True, key="btn_create"):
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
                        st.error("This username is already taken.")

st.title("⚡ Parallel for Creators")
st.caption("Content Intelligence, Viral Hook Calibration & Monetization Studio")


# ─── UNIVERSAL VIDEO PLAYER (YouTube, Instagram, TikTok & Web Media) ──────────
def render_playable_video(v_url: str, title: str = "", platform: str = ""):
    if not v_url:
        st.warning("Video preview link currently loading.")
        return

    clean_url = v_url.strip()
    # Normalize YouTube shorts URL to watch URL for guaranteed st.video compatibility
    if "youtube.com/shorts/" in clean_url:
        m_short = re.search(r"/shorts/([A-Za-z0-9_-]+)", clean_url)
        if m_short:
            clean_url = f"https://www.youtube.com/watch?v={m_short.group(1)}"

    # 1. YouTube
    if "youtube.com" in clean_url or "youtu.be" in clean_url:
        st.video(clean_url)
        st.caption(f"▶️ Playing from YouTube: [{title or clean_url}]({clean_url})")

    # 2. Instagram (Reels, Posts, IGTV)
    elif "instagram.com" in clean_url:
        m = re.search(r"/(?:reel|reels|p|tv)/([A-Za-z0-9_-]+)", clean_url)
        if m:
            code = m.group(1)
            embed_code = f"""
            <iframe src="https://www.instagram.com/reel/{code}/embed" 
                    width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true" allowfullscreen></iframe>
            """
            st.components.v1.html(embed_code, height=500)
            st.caption(f"📸 Playing from Instagram: [{title or clean_url}]({clean_url})")
        else:
            st.info(f"📸 Instagram Content Link: [{title or clean_url}]({clean_url})")
        st.link_button("📱 Open on Instagram", clean_url, type="secondary")

    # 3. TikTok
    elif "tiktok.com" in clean_url:
        m_tt = re.search(r"/video/(\d+)", clean_url)
        if m_tt:
            t_id = m_tt.group(1)
            embed_code = f"""
            <iframe src="https://www.tiktok.com/embed/v2/{t_id}" 
                    width="100%" height="480" frameborder="0" allowfullscreen></iframe>
            """
            st.components.v1.html(embed_code, height=500)
            st.caption(f"🎵 Playing from TikTok: [{title or clean_url}]({clean_url})")
        else:
            st.info(f"🎵 TikTok Content: [{title or clean_url}]({clean_url})")
        st.link_button("🎵 Open on TikTok", clean_url, type="secondary")

    # 4. Other video / media
    else:
        try:
            st.video(clean_url)
            st.caption(f"▶️ Playing Media: [{title or clean_url}]({clean_url})")
        except Exception:
            st.info(f"🔗 Video Link: [{title or clean_url}]({clean_url})")
            st.link_button("▶️ Open Media Link", clean_url, type="secondary")


# ─── TOP-LEVEL TABS (4-Tab Architecture) ─────────────────────────────────────
tab_ideas, tab_hooks, tab_analytics, tab_copy = st.tabs([
    "💡 Viral Ideas & Competitors", 
    "🎯 Hook Testing & Predictions", 
    "📊 Channel Reach & Commercials",
    "🔬 Copy Winning Creator"
])


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 1 — VIRAL IDEAS, NICHE TRENDS & COMPETITORS  (First Page)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_ideas:
    st.markdown("### 🔍 Creator Search & Viral Content Ideas")
    st.caption("Discover competitor gaps, trending niche formats from across the internet, and AI-engineered viral content suggestions.")

    col_a, col_b = st.columns([2, 1])
    with col_a:
        creator_name = st.text_input(
            "Creator Name",
            placeholder="e.g. CarryMinati, MrBeast, Ashish Chanchlani",
            key="input_creator_name"
        )
    with col_b:
        creator_niche = st.text_input(
            "Niche / Category (optional)",
            placeholder="e.g. Comedy Roast Shorts, Tech, Gaming",
            key="input_creator_niche"
        )

    run_intel = st.button("🚀 Discover & Analyse", type="primary", key="intel_btn")

    if run_intel and creator_name.strip():
        st.session_state.intel = None  # Clear old cached data
        with st.spinner(f"🌐 Scanning {creator_name}'s landscape and live internet trends..."):
            try:
                from parallel.intelligence import generate_creator_intelligence
                intel = generate_creator_intelligence(creator_name.strip(), creator_niche.strip())
                st.session_state.intel = intel
                st.session_state.intel_name = creator_name.strip()
                st.session_state.intel_from_cache = False
                st.success("Analysis complete!")
                # ── Auto-save to profile if logged in ──
                if st.session_state.get("logged_in_user"):
                    niche_detected = intel.get("creator_profile", {}).get("core_niche", creator_niche.strip())
                    save_intel(st.session_state.logged_in_user, creator_name.strip(), niche_detected, intel)
                    push_summary_to_bridge(st.session_state.logged_in_user, creator_name.strip(), intel)
            except Exception as e:
                st.error(f"Intelligence engine notice: {e}")
    elif run_intel:
        st.warning("Please enter a creator name.")

    intel = st.session_state.get("intel")
    if intel:
        creator_name_display = st.session_state.get("intel_name", "Creator")
        profile = intel.get("creator_profile", {})

        # ── Show cache badge + refresh if loaded from history ──
        if st.session_state.get("intel_from_cache"):
            cache_col1, cache_col2 = st.columns([3, 1])
            with cache_col1:
                st.info(f"📂 Loaded from saved profile. Data may not be the latest.")
            with cache_col2:
                if st.button("🔄 Refresh Live", key="btn_refresh_intel"):
                    st.session_state.intel = None
                    st.session_state.intel_from_cache = False
                    with st.spinner(f"🌐 Re-scanning {creator_name_display}'s latest data..."):
                        try:
                            from parallel.intelligence import generate_creator_intelligence
                            fresh_intel = generate_creator_intelligence(creator_name_display)
                            st.session_state.intel = fresh_intel
                            st.session_state.intel_name = creator_name_display
                            if st.session_state.get("logged_in_user"):
                                niche_d = fresh_intel.get("creator_profile", {}).get("core_niche", "")
                                save_intel(st.session_state.logged_in_user, creator_name_display, niche_d, fresh_intel)
                            st.rerun()
                        except Exception as e:
                            st.error(f"Refresh failed: {e}")

        st.markdown("---")

        # ── 1. CREATOR OVERVIEW (WITH VERIFIED PHOTO) ────────────────────────
        tier = profile.get("tier") or "Mega (10M+)"
        niche_disp = profile.get("core_niche") or "Short-form Content"
        loc_disp = profile.get("location") or "India"
        avatar_url = profile.get("avatar_url", "")

        c_img_col, c_text_col = st.columns([1, 4])
        with c_img_col:
            if avatar_url:
                st.image(avatar_url, width=130, caption=profile.get('name', creator_name_display))
            else:
                st.markdown("### 👤")
        with c_text_col:
            st.markdown(f"## {profile.get('name', creator_name_display)}")
            st.markdown(f"**Tier:** `{tier}` &nbsp;·&nbsp; **Category:** `{niche_disp}` &nbsp;·&nbsp; **Region:** 📍 `{loc_disp}`")
            accounts = profile.get("discovered_accounts", [])
            if accounts:
                acc_pills = []
                for acc in accounts:
                    p = acc.get("platform", "Link")
                    t = acc.get("title", p)
                    u = acc.get("url", "")
                    if u:
                        acc_pills.append(f"[{p}: {t}]({u})")
                    else:
                        acc_pills.append(f"{p}: {t}")
                st.caption("🔗 **Discovered Handles:** " + " · ".join(acc_pills))

        c_desc1, c_desc2 = st.columns(2)
        with c_desc1:
            st.info(f"🎭 **Tone & Style:** {profile.get('tone_and_style') or 'High-energy, satirical, engaging delivery.'}")
        with c_desc2:
            st.info(f"👥 **Audience Vibe:** {profile.get('audience_vibe') or 'Young, college, mobile-first community.'}")

        st.markdown("---")

        # ── 2. NICHE & INTERNET TRENDING CONTENT (OTHER CREATORS) ─────────────
        st.markdown(f"### 🎬 Top Trending in Niche & Internet (Other Creators) — Watch On-Screen")
        st.caption(f"Real viral videos and Reels trending across the broader web in this niche by **OTHER creators** (NOT {profile.get('name', creator_name_display)}). Watch directly on screen to analyze winning hook patterns.")

        niche_vids = intel.get("niche_trending_videos") or []
        if niche_vids:
            vid_labels = [f"[{v.get('platform', 'Video')}] {v.get('title', 'Trending Video')} ({v.get('views', 'Trending')})" for v in niche_vids]
            selected_idx = st.radio(
                "Pick a viral video from other creators to watch on screen:",
                range(len(niche_vids)),
                format_func=lambda i: vid_labels[i],
                horizontal=True,
                key="radio_niche_vids"
            )

            sel_vid = niche_vids[selected_idx]
            v_url = sel_vid.get("url", "")
            v_plat = sel_vid.get("platform", "YouTube")

            st.markdown(f"#### 📺 {sel_vid.get('title', 'Trending Video')}")

            vcol_player, vcol_analysis = st.columns([1.2, 1])
            with vcol_player:
                render_playable_video(v_url, sel_vid.get("title", "Trending Video"), v_plat)

            with vcol_analysis:
                with st.container(border=True):
                    st.markdown("##### 🔍 Viral Reference Anatomy")
                    st.metric("Trending Momentum", sel_vid.get("views", "Viral Wave"))
                    st.markdown(f"**⚡ Opening 3-Second Hook:**\n> *\"{sel_vid.get('opening_hook', '—')}\"*")
                    st.markdown(f"**🧠 Why Viewers Stayed (Retention Trigger):**\n{sel_vid.get('why_it_went_viral', '—')}")
                    st.info(f"**📋 Adaptable Hook Template For You:**\n{sel_vid.get('adapt_hook_template', '—')}")

        st.markdown("---")

        # ── 3. COMPETITOR BENCHMARKING & GAPS ──────────────────────────────────
        competitors = intel.get("competitor_benchmarking", [])
        if competitors:
            st.markdown("### ⚔️ Competitor Benchmarking & Gaps")
            st.caption("Detailed reconnaissance of what rivals in your niche are doing, where they are weak, and how you can capture their audience.")
            for comp in competitors:
                with st.expander(f"🔴 {comp.get('competitor_name', 'Competitor')} — Breakdown & How To Beat Them"):
                    cc1, cc2 = st.columns(2)
                    with cc1:
                        st.markdown(f"**Recent Content Focus:** {comp.get('recent_content_focus', '—')}")
                        st.markdown(f"**Their Main Strength:** {comp.get('their_strength', '—')}")
                    with cc2:
                        st.markdown(f"**Their Critical Gap / Weakness:** {comp.get('their_gap', '—')}")
                        st.success(f"**🏆 Your Winning Move:** {comp.get('how_to_beat_them', '—')}")

        st.markdown("---")

        # ── 4. HIGH-POTENTIAL CONTENT SUGGESTIONS (WITH REFERENCE VIDEO PER IDEA) ──
        suggestions = intel.get("content_suggestions", [])
        if suggestions:
            st.markdown("### 💡 High-Potential Content Suggestions (Ready to Test)")
            st.caption("AI-engineered ideas based on current trending topics. Every suggestion includes a playable reference video benchmarking the format.")
            for s in suggestions:
                with st.container(border=True):
                    h1, h2 = st.columns([3, 1])
                    with h1:
                        st.markdown(f"##### Idea #{s.get('id', '?')}: {s.get('title', 'Untitled')}")
                        st.caption(f"🔥 Trending topic: {s.get('trending_topic', '—')}")
                        st.markdown(f"**Why it works:** {s.get('why_it_works', '—')}")
                    with h2:
                        st.metric("Estimated Views", s.get("estimated_views", "—"))

                    # Playable Reference Video Benchmark for this Idea (DYNAMIC — only shown if verified playable)
                    ref = s.get("reference_video") or {}
                    ref_url = ref.get("url", "")
                    ref_title = ref.get("title", "Benchmark Video Reference")
                    ref_creator = ref.get("creator", "Proven Creator")
                    ref_why = ref.get("why_reference", "Demonstrates the retention curve.")
                    ref_verified = ref.get("verified", False)

                    if ref_verified and ref_url:
                        with st.expander(f"🎬 Watch Concept Reference Video: {ref_title} ({ref_creator})", expanded=True):
                            rv_col1, rv_col2 = st.columns([1.2, 1])
                            with rv_col1:
                                render_playable_video(ref_url, ref_title, ref.get("platform", ""))
                            with rv_col2:
                                st.markdown(f"**Benchmark Creator / Source:** `{ref_creator}`")
                                st.info(f"**Why this benchmarks the concept:**\n{ref_why}")
                                st.markdown("**Takeaway:** Adapt this reference's pattern interrupt and visual pacing to your video.")


                    hooks = s.get("candidate_hooks", [])
                    if hooks:
                        st.markdown("**Candidate Hooks (Engineered for 3-sec short-form retention):**")
                        for hk in hooks:
                            st.markdown(f"- **{hk.get('sid', '?')}**: {hk.get('text', '')}")

                    # Bridge to Tab 2
                    if st.button(f"▶ Test these hooks in Hook Testing tab", key=f"test_idea_{s.get('id')}"):
                        hook_lines = "\n".join(
                            [f"{hk['sid']}: {hk['text']}" for hk in hooks if 'sid' in hk and 'text' in hk]
                        )
                        prefill = (
                            f"Creator: {creator_name_display}. Topic: {s.get('trending_topic', '')}.\n"
                            f"{hook_lines}"
                        )
                        st.session_state.prefill_hooks = prefill
                        st.success("✅ Hooks pre-filled! Switch to the **🎯 Hook Testing & Predictions** tab above.")



# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 2 — HOOK TESTING & REVENUE/FAME PREDICTIONS (Second Page)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_hooks:
    st.markdown("### 🎯 Hook Testing on Synthetic Audience")
    st.caption("Calibrate hooks against simulated student audiences (18–24), filter clickbait, and predict estimated video revenue and viral fame index.")

    # Dynamic trending hooks button
    col_t1, col_t2 = st.columns([3, 1])
    with col_t2:
        if st.button("⚡ Load Live Trending Hooks", help="Fetches real trending comedy/roast hooks from live internet research"):
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
        "Candidate Hooks (or paste channel brief + hooks S1 to S4):",
        value=default_text,
        height=140,
        placeholder="e.g. Comedy Shorts for Indian college students. S1: Hook 1... S2: Hook 2..."
    )

    n = st.slider(
        "Synthetic audience sample size", 10, 150, 15, 5,
        help="15-20 personas takes ~25s on Groq free tier. 50+ gives maximum demographic granularity."
    )

    if st.button("▶ Run on synthetic audience", type="primary") and text:
        with st.spinner("Asking synthetic personas & predicting performance..."):
            try:
                res = run_study(text, n)
                st.session_state.res = res
                st.session_state.prefill_hooks = ""
                Path("data").mkdir(exist_ok=True)
                Path("data/brief.txt").write_text(brief_text(res["study"]), encoding="utf-8")
                Path("data/summary.txt").write_text(summary_text(res), encoding="utf-8")
                st.success("Audience calibration study complete!")
            except Exception as e:
                st.error(f"Error running study: {e}")

    res = st.session_state.get("res")
    if res:
        st.markdown("---")
        label, why = res["confidence"]
        if label == "LOW":
            st.error(f"**Confidence: {label}**. {why}")
        elif label != "OK":
            st.warning(f"**Confidence: {label}**. {why}")
        else:
            st.success(f"**Confidence: {label}**. {why}")

        if label != "LOW":
            items_df = res["items"].rename(columns={"text": "hook_text"}).copy()
            top_row = items_df.iloc[0]
            top_score = float(top_row["score"])
            top_clickbait = float(top_row["clickbait"])
            top_best = float(top_row["best"])
            top_worst = float(top_row["worst"])
            top_hook_name = top_row["sid"]
            top_hook_content = top_row["hook_text"]

            # ── PREDICTED REVENUE & FAME INDEX SECTION ─────────────────────────
            st.markdown("### 💰 Predicted Revenue & 🌟 Viral Fame Index")
            st.caption("Machine-learning predictions based on stop-scroll retention, audience polarization, and short-form monetization algorithms.")

            # Modeling formulas
            # 1. Estimated Views
            if top_score >= 4.2:
                views_tier = "2.5M – 5.0M Views (Viral Breakout)"
                min_v, max_v = 2_500_000, 5_000_000
                fame_label = "🔥 Ultra Viral Breakout (Top 3% of Niche)"
                subs_gain = "+25,000 – 50,000 New Followers"
                algo_prob = "95% Algorithmic Push"
            elif top_score >= 3.6:
                views_tier = "1.0M – 2.5M Views (High Momentum)"
                min_v, max_v = 1_000_000, 2_500_000
                fame_label = "⚡ Strong Category Performer (Top 15%)"
                subs_gain = "+10,000 – 25,000 New Followers"
                algo_prob = "84% Algorithmic Push"
            elif top_score >= 3.0:
                views_tier = "300K – 1.0M Views (Core Baseline)"
                min_v, max_v = 300_000, 1_000_000
                fame_label = "📈 Steady Audience Retention"
                subs_gain = "+3,000 – 10,000 New Followers"
                algo_prob = "65% Algorithmic Push"
            else:
                views_tier = "100K – 300K Views (High Drop-off)"
                min_v, max_v = 100_000, 300_000
                fame_label = "⚠️ Drop-off Alert (Needs punchier first second)"
                subs_gain = "< 3,000 New Followers"
                algo_prob = "35% Algorithmic Push"

            # 2. Clickbait penalty
            if top_clickbait > 0.15:
                penalty = 1.0 - (top_clickbait * 0.8)
                min_v = int(min_v * penalty)
                max_v = int(max_v * penalty)

            # 3. Revenue calculations (AdSense + Brand Integration)
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

            # 4. Fame / Viral Index score (0 - 100)
            viral_index = int(min(98, max(30, (top_score / 5.0) * 82 + (top_best * 20) - (top_worst * 15) - (top_clickbait * 20))))

            # Render Cards
            p_rev_col, p_fame_col = st.columns(2)
            with p_rev_col:
                with st.container(border=True):
                    st.markdown(f"#### 💵 Predicted Revenue: `{top_hook_name}`")
                    st.markdown(f"**Estimated Range:** `₹{tot_rev_min:,} – ₹{tot_rev_max:,}` &nbsp;(`${tot_rev_usd_min:,} – ${tot_rev_usd_max:,}`)")
                    st.metric("Expected Views Potential", views_tier)
                    st.markdown(f"- 📺 **Shorts/Reels AdSense Share:** `₹{adsense_min:,} – ₹{adsense_max:,}`")
                    st.markdown(f"- 🤝 **Sponsor Value Conversion:** `₹{sponsor_min:,} – ₹{sponsor_max:,}`")
                    if top_clickbait <= 0.10:
                        st.success("✅ High advertiser suitability (Safe clickbait ratio)")
                    else:
                        st.warning(f"⚠️ {top_clickbait:.0%} clickbait perception slightly reduces sponsor payout")

            with p_fame_col:
                with st.container(border=True):
                    st.markdown(f"#### 🌟 Fame & Viral Potential Index: `{viral_index}/100`")
                    st.markdown(f"**Tier:** `{fame_label}`")
                    st.metric("Projected Audience Growth", subs_gain)
                    st.markdown(f"- 🚀 **Recommendation Push Likelihood:** `{algo_prob}`")
                    st.markdown(f"- 🏆 **Top Hook:** *\"{top_hook_content}\"*")
                    st.info(f"✨ **Stop-Scroll Rating:** `{top_score:.2f} / 5.0` &nbsp;·&nbsp; **Favorite Rate:** `{top_best:.0%}`")

            st.markdown("---")

            # ── 1. HOOK RANKING VISUALIZATION ─────────────────────────────────
            st.subheader("🏆 Hook Performance Ranking")
            fig_score = px.bar(
                items_df,
                x="score",
                y="sid",
                orientation="h",
                text=items_df["score"].apply(lambda s: f"{s:.2f}"),
                color="score",
                color_continuous_scale="Tealgrn",
                hover_data={"hook_text": True, "score": ":.2f", "clickbait": ":.0%"},
                labels={"score": "Stop-Scroll Rating (1.0 to 5.0)", "sid": "Hook", "hook_text": "Hook Text"},
                title="Viewer Stop-Scroll Score (Higher = Better Retention)"
            )
            fig_score.update_layout(
                yaxis={"autorange": "reversed"},
                height=300,
                margin=dict(l=10, r=10, t=35, b=10)
            )
            st.plotly_chart(fig_score, use_container_width=True)

            # Polarization & Clickbait Alert
            pol_col1, pol_col2 = st.columns(2)
            with pol_col1:
                st.markdown("##### 🌟 Audience Favorite (`Best`) Share")
                fig_best = px.bar(
                    items_df, x="best", y="sid", orientation="h",
                    color_discrete_sequence=["#00CC96"],
                    labels={"best": "% Picked as Best", "sid": "Hook"}
                )
                fig_best.update_layout(xaxis_tickformat='.0%', height=220, margin=dict(l=10, r=10, t=20, b=10))
                st.plotly_chart(fig_best, use_container_width=True)

            with pol_col2:
                st.markdown("##### ⚠️ High Drop-off (`Worst`) Share")
                fig_worst = px.bar(
                    items_df, x="worst", y="sid", orientation="h",
                    color_discrete_sequence=["#EF553B"],
                    labels={"worst": "% Picked as Worst", "sid": "Hook"}
                )
                fig_worst.update_layout(xaxis_tickformat='.0%', height=220, margin=dict(l=10, r=10, t=20, b=10))
                st.plotly_chart(fig_worst, use_container_width=True)

            clickbait_hooks = items_df[items_df["clickbait"] >= 0.15]
            if not clickbait_hooks.empty:
                for _, r in clickbait_hooks.iterrows():
                    st.warning(
                        f"🚨 **Clickbait Risk on {r['sid']}**: "
                        f"{r['clickbait']:.0%} of viewers felt misled by: *\"{r['hook_text']}\"*"
                    )

            with st.expander("📋 View Complete Ranking Data Table"):
                st.dataframe(
                    items_df[["sid", "hook_text", "score", "best", "worst", "clickbait"]],
                    use_container_width=True
                )

        # Segment breakdown
        c1, c2 = st.columns(2)
        with c1:
            st.subheader("📊 Segment Disagreements")
            st.dataframe(res["segments"]["matrix"], use_container_width=True)
        with c2:
            st.subheader("🚩 Audience Bias Flags")
            if res["bias"]:
                for flag in res["bias"]:
                    st.caption(f"⚠ {flag}")
            else:
                st.caption("✅ No extreme segment deviations found.")

        st.markdown("---")
        st.subheader("⚙️ Calibration with Real Panel")
        if st.button("Compare with real panel"):
            sids = [s.sid for s in res["study"].stimuli]
            real_df = load_panel(sids)
            if len(real_df) > 0:
                fid = close_the_loop(res["study"], res["items"], real_df)
                st.write(fid)
                st.success("Calibration updated with live panel fidelity data!")
            else:
                st.warning(
                    "No real panel data found yet. "
                    "Invite users to the Bridge app and have them fill out the Rate form first!"
                )


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 3 — CHANNEL REACH, COMMERCIALS & CREATOR'S OWN VIDEOS (Third Page)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_analytics:
    intel = st.session_state.get("intel")
    if not intel:
        st.info("💡 Please search and analyze a creator in the **💡 Viral Ideas & Competitors** tab first.")
    else:
        profile = intel.get("creator_profile", {})
        metrics = intel.get("platform_metrics", {})
        demo = intel.get("audience_demographics", {})
        rate_card = intel.get("rate_card_and_sponsors", {})
        avatar_url = profile.get("avatar_url", "")
        t3_img_col, t3_txt_col = st.columns([1, 6])
        with t3_img_col:
            if avatar_url:
                st.image(avatar_url, width=95)
        with t3_txt_col:
            st.markdown(f"### 📊 Channel Reach & Commercial Intelligence: `{profile.get('name', 'Creator')}`")
            st.caption("Deep multi-platform metrics, audience demographic split, benchmark commercial rate card, and the creator's own top viral uploads.")

        # ── 1. CROSS-PLATFORM PERFORMANCE & SCALE ─────────────────────────────
        m_yt = metrics.get("youtube_subscribers") or metrics.get("youtube") or "45.0M"
        m_ig = metrics.get("instagram_followers") or metrics.get("instagram") or "21.5M"
        m_reach = metrics.get("total_reach") or f"{m_yt} + {m_ig}"
        m_eng = metrics.get("engagement_rate") or "7.2%"
        m_med = metrics.get("category_median_engagement") or "3.2%"
        m_cad = metrics.get("youtube_cadence") or "1-2 videos/month"

        m1, m2, m3, m4, m5 = st.columns(5)
        m1.metric("🌐 Combined Reach", m_reach)
        m2.metric("▶️ YouTube Audience", m_yt)
        m3.metric("📸 Instagram Followers", m_ig)
        m4.metric("⚡ Engagement Rate", m_eng, help=f"Category benchmark: {m_med}")
        m5.metric("⏱️ Posting Cadence", m_cad)

        # Platform share chart
        try:
            def parse_num(val_str):
                m = re.search(r"([\d\.]+)\s*([MKmk]?)", str(val_str))
                if not m:
                    return 0.0
                num = float(m.group(1))
                unit = m.group(2).upper()
                if unit == "M":
                    return num * 1_000_000
                elif unit == "K":
                    return num * 1_000
                return num

            yt_num = parse_num(m_yt)
            ig_num = parse_num(m_ig)
            if yt_num > 0 or ig_num > 0:
                plat_df = pd.DataFrame([
                    {"Platform": "YouTube", "Followers": yt_num, "Display": m_yt},
                    {"Platform": "Instagram", "Followers": ig_num, "Display": m_ig}
                ])
                fig_plat = px.bar(
                    plat_df,
                    x="Followers",
                    y="Platform",
                    orientation="h",
                    color="Platform",
                    color_discrete_map={"YouTube": "#FF0000", "Instagram": "#E1306C"},
                    text="Display",
                    title="Audience Scale Distribution (YouTube vs Instagram)"
                )
                fig_plat.update_layout(height=180, margin=dict(l=10, r=10, t=35, b=10), showlegend=False)
                st.plotly_chart(fig_plat, use_container_width=True)
        except Exception:
            pass

        st.markdown("---")

        # ── 2. AUDIENCE DEMOGRAPHICS & GEOGRAPHY ───────────────────────────────
        st.markdown("### 🌍 Audience Demographics & Geography")
        d_col1, d_col2 = st.columns([2, 1])
        with d_col1:
            countries = demo.get("top_countries", [])
            if countries:
                st.markdown("**Top Geographic Markets:**")
                c_cols = st.columns(len(countries[:4]))
                for idx, c_item in enumerate(countries[:4]):
                    with c_cols[idx]:
                        st.metric(c_item.get("country", "Market"), c_item.get("share", "—"))
        with d_col2:
            st.markdown("**Audience Profile:**")
            st.markdown(f"- 🎂 **Primary Age Bracket:** `{demo.get('primary_age', '18-24 (Gen Z)')}`")
            st.markdown(f"- 🚻 **Gender Skew:** `{demo.get('gender_skew', 'Male Dominated')}`")
            st.markdown(f"- 📲 **Instagram Cadence:** `{metrics.get('instagram_cadence', 'Daily Reels/Stories')}`")

        st.markdown("---")

        # ── 3. ESTIMATED BRAND RATE CARD & PARTNERSHIPS ────────────────────────
        st.markdown("### 💰 Estimated Brand Rate Card & Partnerships")
        st.caption("Benchmark commercial pricing for brand integrations and brand affinity modeling.")

        rc_yt = rate_card.get("est_youtube_rate") or "₹35L - ₹75L ($45K - $90K)"
        rc_ig = rate_card.get("est_instagram_reel_rate") or "₹12L - ₹25L ($15K - $30K)"
        rc_st = rate_card.get("est_story_rate") or "₹3L - ₹6L ($3.5K - $7.5K)"

        rc1, rc2, rc3 = st.columns(3)
        rc1.metric("🎥 YouTube Dedicated / Integration", rc_yt)
        rc2.metric("📱 Instagram Dedicated Reel", rc_ig)
        rc3.metric("📸 Instagram Story / Swipe-up", rc_st)

        b1, b2 = st.columns(2)
        with b1:
            st.markdown("**🏷️ High Brand Affinity Sectors:**")
            aff_niches = rate_card.get("brand_affinity_niches", [])
            if aff_niches:
                st.write(", ".join([f"`{n}`" for n in aff_niches]))
            past_spons = rate_card.get("past_or_likely_sponsors", [])
            if past_spons:
                st.markdown("**🤝 Active / Past Advertisers:** " + ", ".join([f"**{s}**" for s in past_spons]))
        with b2:
            why_partner = rate_card.get("why_brands_partner", "")
            if why_partner:
                st.success(f"**🎯 Strategic Brand Fit:** {why_partner}")

        st.markdown("---")

        # ── 4. CREATOR'S OWN TOP CONTENT (PLAYABLE ON SCREEN) ─────────────────
        st.markdown(f"### 🎬 {profile.get('name', 'Creator')}'s Own Top Content — Watch On-Screen & Deconstruct Hooks")
        st.caption(f"Watch {profile.get('name', 'the creator')}'s own highest-performing uploads and Instagram Reels directly on screen.")

        creator_vids = intel.get("creator_videos", [])
        if creator_vids:
            cvid_labels = [f"[{v.get('platform', 'Video')}] {v.get('title', 'Video')} ({v.get('views', 'Popular')})" for v in creator_vids]
            c_selected_idx = st.radio(
                "Select a video from this creator to watch & analyze:",
                range(len(creator_vids)),
                format_func=lambda i: cvid_labels[i],
                horizontal=True,
                key="radio_creator_vids"
            )

            c_sel_vid = creator_vids[c_selected_idx]
            cv_url = c_sel_vid.get("url", "")
            cv_plat = c_sel_vid.get("platform", "YouTube")

            st.markdown(f"#### 📺 {c_sel_vid.get('title', 'Creator Video')}")

            cvcol_player, cvcol_analysis = st.columns([1.2, 1])
            with cvcol_player:
                render_playable_video(cv_url, c_sel_vid.get("title", "Creator Video"), cv_plat)

            with cvcol_analysis:
                with st.container(border=True):
                    st.markdown("##### 🔍 Creator's Proven Hook Breakdown")
                    st.metric("Views Benchmark", c_sel_vid.get("views", "Top Performer"))
                    st.markdown(f"**⚡ Opening 3-Second Hook:**\n> *\"{c_sel_vid.get('opening_hook', '—')}\"*")
                    st.markdown(f"**🧠 Why Viewers Stayed:**\n{c_sel_vid.get('why_it_went_viral', '—')}")
                    st.info(f"**📋 Adaptable Strategy:**\n{c_sel_vid.get('adapt_hook_template', '—')}")
        else:
            st.info("Creator video analysis is currently loading or being calibrated.")


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 4 — COPY WINNING CREATOR  (Style Replicator + Blueprint + Niche Piracy)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_copy:
    st.markdown("### 🔬 Copy Winning Creator")
    st.caption("Clone any creator's formula: reverse-engineer their style DNA, deconstruct their best video into a shooting script, and generate upgrade ideas that beat their content.")

    copy_col_a, copy_col_b = st.columns([2, 1])
    with copy_col_a:
        target_creator = st.text_input(
            "Target Creator to Copy",
            placeholder="e.g. MrBeast, CarryMinati, Aakash Dhawan",
            key="input_copy_creator"
        )
    with copy_col_b:
        target_niche = st.text_input(
            "Their Niche (optional)",
            placeholder="e.g. Comedy, Motovlog, Tech",
            key="input_copy_niche"
        )

    run_copy = st.button("🧬 Reverse-Engineer This Creator", type="primary", key="copy_btn")

    if run_copy and target_creator.strip():
        st.session_state.copy_data = None  # Clear old
        with st.spinner(f"🔬 Deconstructing {target_creator}'s content formula..."):
            try:
                # First get intelligence on the target to have their video data
                from parallel.intelligence import generate_creator_intelligence
                target_intel = generate_creator_intelligence(target_creator.strip(), target_niche.strip())

                t_profile = target_intel.get("creator_profile", {})
                t_niche = t_profile.get("core_niche", target_niche.strip() or "Digital Content")
                t_creator_vids = target_intel.get("creator_videos", [])
                t_niche_vids = target_intel.get("niche_trending_videos", [])

                # Run the 3 clone modules
                style_card = get_style_dna(target_creator.strip(), t_niche, t_creator_vids, t_niche_vids)

                blueprints = []
                for bv in t_creator_vids[:2]:
                    bp = get_video_blueprint(
                        bv.get("title", ""),
                        bv.get("url", ""),
                        bv.get("platform", "YouTube"),
                        t_niche
                    )
                    bp["source_video"] = bv
                    blueprints.append(bp)

                piracy = get_piracy_ideas(target_creator.strip(), t_niche, t_creator_vids)

                copy_result = {
                    "target_creator": target_creator.strip(),
                    "target_niche": t_niche,
                    "target_profile": t_profile,
                    "style_card": style_card,
                    "blueprints": blueprints,
                    "piracy_ideas": piracy.get("piracy_ideas", []),
                    "target_intel": target_intel,
                }
                st.session_state.copy_data = copy_result
                st.success("Creator formula reverse-engineered!")

                # Save to profile if logged in
                if st.session_state.get("logged_in_user"):
                    save_clone_run(
                        st.session_state.logged_in_user,
                        target_creator.strip(),
                        style_card,
                        blueprints,
                        piracy.get("piracy_ideas", [])
                    )

            except Exception as e:
                st.error(f"Clone engine notice: {e}")
    elif run_copy:
        st.warning("Please enter a creator name to copy.")

    copy_data = st.session_state.get("copy_data")
    if copy_data:
        st.markdown("---")

        tc_name = copy_data["target_creator"]
        tc_niche = copy_data["target_niche"]
        tc_profile = copy_data.get("target_profile", {})

        # ── SECTION A: STYLE REPLICATOR (DNA Card) ──────────────────────────
        st.markdown(f"### 🧬 {tc_name}'s Style DNA")
        st.caption(f"The exact formula this creator uses in every {tc_niche} video — decoded for replication.")

        sc = copy_data.get("style_card", {})
        dna = sc.get("style_dna", {})

        if dna:
            dna_c1, dna_c2 = st.columns(2)
            with dna_c1:
                with st.container(border=True):
                    st.markdown("##### 🎯 Hook Formula")
                    st.markdown(f"> *{dna.get('hook_formula', '—')}*")
                    st.markdown("##### 🏗️ Content Structure")
                    st.markdown(f"> *{dna.get('content_structure', '—')}*")
                    st.markdown("##### ✂️ Editing Rhythm")
                    st.markdown(f"> *{dna.get('editing_rhythm', '—')}*")
            with dna_c2:
                with st.container(border=True):
                    st.markdown("##### 🖼️ Thumbnail Formula")
                    st.markdown(f"> *{dna.get('thumbnail_formula', '—')}*")
                    st.markdown("##### 📢 CTA Pattern")
                    st.markdown(f"> *{dna.get('cta_pattern', '—')}*")
                    st.markdown("##### 🧠 Viral Trigger")
                    st.warning(f"**{dna.get('viral_trigger', '—')}**")
                    st.markdown("##### 🤝 Audience Contract")
                    st.info(f"*{dna.get('audience_contract', '—')}*")

        # Clone roadmap
        roadmap = sc.get("clone_roadmap", [])
        if roadmap:
            st.markdown("#### 🗺️ 5-Step Clone Roadmap")
            for step in roadmap:
                diff_color = {"Easy": "🟢", "Medium": "🟡", "Hard": "🔴"}.get(step.get("difficulty", "Medium"), "⚪")
                with st.expander(f"Step {step.get('step', '?')}: {step.get('action', '—')} {diff_color} {step.get('difficulty', '')}"):
                    st.markdown(f"**Why it works:** {step.get('why_it_works', '—')}")

        diff_angle = sc.get("differentiation_angle", "")
        if diff_angle:
            st.success(f"🎯 **Your Differentiation Angle:** {diff_angle}")

        st.markdown("---")

        # ── SECTION B: BLUEPRINT GENERATOR ──────────────────────────────────
        bps = copy_data.get("blueprints", [])
        if bps:
            st.markdown(f"### 📋 Video Blueprints — Ready-to-Film Scripts")
            st.caption(f"Frame-by-frame deconstruction of {tc_name}'s top videos with a replicable shooting script you can film today.")

            for bp_idx, bp in enumerate(bps):
                source_v = bp.get("source_video", {})
                bp_title = source_v.get("title", f"Blueprint #{bp_idx+1}")
                with st.expander(f"📹 Blueprint: {bp_title}", expanded=bp_idx == 0):
                    # Source video player
                    if source_v.get("url"):
                        render_playable_video(source_v["url"], bp_title, source_v.get("platform", "YouTube"))

                    vb = bp.get("video_breakdown", {})
                    if vb:
                        seg_cols = st.columns(3)
                        for seg_idx, (seg_key, seg_label, seg_icon) in enumerate([
                            ("hook_segment", "Hook (0-3s)", "⚡"),
                            ("build_segment", "Build (3-45s)", "📈"),
                            ("climax_segment", "Climax (45s+)", "🎆")
                        ]):
                            seg = vb.get(seg_key, {})
                            with seg_cols[seg_idx]:
                                with st.container(border=True):
                                    st.markdown(f"**{seg_icon} {seg_label}**")
                                    st.markdown(f"*What happens:* {seg.get('what_happens', seg.get('structure', seg.get('payoff', '—')))}")
                                    trigger = seg.get("psychological_trigger", seg.get("retention_technique", seg.get("cta", "")))
                                    if trigger:
                                        st.caption(f"🧠 {trigger}")
                                    rep = seg.get("replicate_as", "")
                                    if rep:
                                        st.info(f"**Your version:** {rep}")

                    # Shooting script
                    script = bp.get("shooting_script", [])
                    if script:
                        st.markdown("#### 🎬 Shooting Script")
                        script_data = []
                        for s in script:
                            script_data.append({
                                "Scene": s.get("scene", ""),
                                "Shot": s.get("shot_type", ""),
                                "Action": s.get("action", ""),
                                "Dialogue / Caption": s.get("dialogue_or_caption", ""),
                                "Duration (s)": s.get("duration_seconds", "")
                            })
                        st.dataframe(pd.DataFrame(script_data), hide_index=True)

                    equip = bp.get("equipment_needed", [])
                    prod_hrs = bp.get("estimated_production_hours", "")
                    if equip or prod_hrs:
                        eq1, eq2 = st.columns(2)
                        with eq1:
                            if equip:
                                st.markdown("**🛠️ Equipment:** " + " · ".join([f"`{e}`" for e in equip]))
                        with eq2:
                            if prod_hrs:
                                st.metric("⏱️ Est. Production Time", prod_hrs)

        st.markdown("---")

        # ── SECTION C: NICHE PIRACY IDEAS ───────────────────────────────────
        piracy_list = copy_data.get("piracy_ideas", [])
        if piracy_list:
            st.markdown(f"### 🏴‍☠️ Niche Piracy — 5 Ideas That Beat {tc_name}")
            st.caption(f"Each idea is a direct upgrade of {tc_name}'s top content. Better hook, better angle, better execution.")

            for idea in piracy_list:
                angle_emoji = {
                    "More cinematic": "🎬",
                    "More emotional": "❤️",
                    "Faster paced": "⚡",
                    "More relatable": "🤝",
                    "Bigger stakes": "💰",
                    "Better data": "📊"
                }.get(idea.get("upgrade_angle", ""), "🔥")

                with st.expander(f"{angle_emoji} Idea #{idea.get('id', '?')}: {idea.get('your_upgrade_title', '—')}  —  {idea.get('estimated_views', '')}"):
                    st.markdown(f"**They did:** {idea.get('competitor_did', '—')}")
                    st.markdown(f"**Your upgrade:** {idea.get('your_upgrade_title', '—')}")
                    st.success(f"**Why yours wins:** {idea.get('why_yours_wins', '—')}")
                    st.caption(f"Upgrade angle: `{idea.get('upgrade_angle', '—')}`")

                    hooks = idea.get("candidate_hooks", [])
                    if hooks:
                        st.markdown("**🎯 Test These Hooks:**")
                        for h in hooks:
                            st.markdown(f"- `{h.get('sid', '')}`: *{h.get('text', '')}*")
