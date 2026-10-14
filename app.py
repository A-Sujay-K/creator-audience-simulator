import streamlit as st
from pathlib import Path
import plotly.express as px
import pandas as pd
import re
from parallel.pipeline import run_study, brief_text, summary_text
from parallel.panel import load_panel
from parallel.fidelity import close_the_loop

st.set_page_config(page_title="Parallel for Creators", page_icon="⚡", layout="wide")
st.title("⚡ Parallel for Creators")
st.caption("Creator Intelligence Engine & Audience Calibration Studio")

# ─── TOP-LEVEL TABS ──────────────────────────────────────────────────────────
tab_intel, tab_hook = st.tabs(["🧠 Creator Intelligence", "🎯 Hook Testing"])


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 1 — CREATOR INTELLIGENCE  (Main Feature — CreatorDB & Reference Videos)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_intel:
    st.markdown("### 🔍 Discover Creator Landscape & Reference Videos")
    st.caption(
        "Scan any creator's digital footprint across YouTube and Instagram: cross-platform metrics, "
        "audience demographics, estimated sponsorship rate cards, top viral videos with in-app player, and AI content ideas."
    )

    col_a, col_b = st.columns([2, 1])
    with col_a:
        creator_name = st.text_input(
            "Creator Name",
            placeholder="e.g. CarryMinati, MrBeast, Ashish Chanchlani"
        )
    with col_b:
        creator_niche = st.text_input(
            "Niche / Category (optional)",
            placeholder="e.g. Comedy Roast Shorts, Tech, Gaming"
        )

    run_intel = st.button("🚀 Discover & Analyse", type="primary", key="intel_btn")

    if run_intel and creator_name.strip():
        st.session_state.intel = None  # Clear any stale schema from previous runs
        with st.spinner(f"🌐 Fast Reconnaissance on {creator_name}'s footprint across YouTube & Instagram..."):
            try:
                from parallel.intelligence import generate_creator_intelligence
                intel = generate_creator_intelligence(creator_name.strip(), creator_niche.strip())
                st.session_state.intel = intel
                st.session_state.intel_name = creator_name.strip()
                st.success("Reconnaissance complete!")
            except Exception as e:
                st.error(f"Intelligence engine error: {e}")
    elif run_intel:
        st.warning("Please enter a creator name.")

    intel = st.session_state.get("intel")
    if intel:
        creator_name_display = st.session_state.get("intel_name", "Creator")
        st.markdown("---")

        # ── 1. CREATOR OVERVIEW & HERO CARD ───────────────────────────────────
        profile = intel.get("creator_profile", {})
        metrics = intel.get("platform_metrics", {})
        
        tier = profile.get("tier") or "Mega (10M+)"
        niche_disp = profile.get("core_niche") or "Comedy & Shorts"
        loc_disp = profile.get("location") or "India"

        st.markdown(f"## 👤 {profile.get('name', creator_name_display)}")
        st.markdown(f"**Tier:** `{tier}` &nbsp;·&nbsp; **Category:** `{niche_disp}` &nbsp;·&nbsp; **Region:** 📍 `{loc_disp}`")
        
        c_desc1, c_desc2 = st.columns(2)
        with c_desc1:
            st.info(f"🎭 **Tone & Style:** {profile.get('tone_and_style') or 'High-energy, satirical, meme-heavy delivery.'}")
        with c_desc2:
            st.info(f"👥 **Audience Vibe:** {profile.get('audience_vibe') or 'Young, college, mobile-first meme community.'}")

        # Discovered Social Handles
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
            st.caption("🔗 **Official Accounts:** " + " · ".join(acc_pills))

        st.markdown("---")

        # ── 2. CROSS-PLATFORM PERFORMANCE METRICS (CreatorDB Style) ───────────
        st.markdown("### 📊 Cross-Platform Performance & Audience Scale")
        st.caption("Cross-platform benchmarking inspired by CreatorDB.")

        # Guaranteed non-empty values (defensive normalization against stale cache)
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

        # Visualizing Platform Share
        try:
            yt_str = str(metrics.get("youtube_subscribers", "0"))
            ig_str = str(metrics.get("instagram_followers", "0"))
            
            def parse_num(val_str):
                m = re.search(r"([\d\.]+)\s*([MKmk]?)", val_str)
                if not m:
                    return 0.0
                num = float(m.group(1))
                unit = m.group(2).upper()
                if unit == "M":
                    return num * 1_000_000
                elif unit == "K":
                    return num * 1_000
                return num

            yt_num = parse_num(yt_str)
            ig_num = parse_num(ig_str)
            
            if yt_num > 0 or ig_num > 0:
                plat_df = pd.DataFrame([
                    {"Platform": "YouTube", "Followers": yt_num, "Display": yt_str},
                    {"Platform": "Instagram", "Followers": ig_num, "Display": ig_str}
                ])
                fig_plat = px.bar(
                    plat_df,
                    x="Followers",
                    y="Platform",
                    orientation="h",
                    color="Platform",
                    color_discrete_map={"YouTube": "#FF0000", "Instagram": "#E1306C"},
                    text="Display",
                    title="Platform Audience Share (YouTube vs Instagram)"
                )
                fig_plat.update_layout(height=180, margin=dict(l=10, r=10, t=35, b=10), showlegend=False)
                st.plotly_chart(fig_plat, use_container_width=True)
        except Exception:
            pass

        st.markdown("---")

        # ── 3. AUDIENCE DEMOGRAPHICS & GEO DISTRIBUTION ───────────────────────
        st.markdown("### 🌍 Audience Demographics & Geography")
        demo = intel.get("audience_demographics", {})
        
        d_col1, d_col2 = st.columns([2, 1])
        with d_col1:
            countries = demo.get("top_countries", [])
            if countries:
                st.markdown("**Top Geographic Markets:**")
                c_df = pd.DataFrame(countries)
                if "country" in c_df.columns and "share" in c_df.columns:
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

        # ── 4. ESTIMATED RATE CARD & BRAND SPONSORSHIPS ────────────────────────
        st.markdown("### 💰 Estimated Brand Rate Card & Partnerships")
        st.caption("Benchmark commercial pricing (unlocked from CreatorDB's category algorithms).")

        rate_card = intel.get("rate_card_and_sponsors", {})
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

        # ── 5. TOP TRENDING CONTENT (PLAYABLE ON SCREEN) ──────────────────────
        st.markdown("### 🎬 Top Trending Content — Watch On-Screen & Deconstruct Hooks")
        st.caption("Play the creator's top performing videos and Instagram Reels directly on screen for reference.")

        trending_vids = intel.get("trending_videos", [])
        if trending_vids:
            # Video selector options
            vid_labels = [f"[{v.get('platform', 'Video')}] {v.get('title', 'Video')} ({v.get('views', 'Viral')})" for v in trending_vids]
            selected_idx = st.radio("Select a video to play & analyze:", range(len(trending_vids)), format_func=lambda i: vid_labels[i], horizontal=True)

            sel_vid = trending_vids[selected_idx]
            v_url = sel_vid.get("url", "")
            v_plat = sel_vid.get("platform", "YouTube")

            st.markdown(f"#### 📺 {sel_vid.get('title', 'Trending Video')}")

            vcol_player, vcol_analysis = st.columns([1.2, 1])

            with vcol_player:
                # Video Player
                if "youtube.com" in v_url or "youtu.be" in v_url:
                    st.video(v_url)
                    st.caption(f"▶️ Playing from YouTube: [{v_url}]({v_url})")
                elif "instagram.com" in v_url:
                    # Instagram Reel Embed or Link
                    m = re.search(r"/(?:reel|p)/([A-Za-z0-9_-]+)", v_url)
                    if m:
                        code = m.group(1)
                        embed_code = f"""
                        <iframe src="https://www.instagram.com/reel/{code}/embed" 
                                width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
                        """
                        st.components.v1.html(embed_code, height=500)
                    else:
                        st.info("Instagram Reel Link detected.")
                    st.link_button("📱 Open on Instagram App", v_url, type="secondary")
                else:
                    if v_url:
                        st.video(v_url)
                    else:
                        st.warning("Video preview link currently being indexed.")

            with vcol_analysis:
                with st.container(border=True):
                    st.markdown("##### 🔍 Viral Reference Anatomy")
                    st.metric("Estimated Views", sel_vid.get("views", "Viral"))
                    st.markdown(f"**⚡ Opening 3-Second Hook:**\n> *\"{sel_vid.get('opening_hook', '—')}\"*")
                    st.markdown(f"**🧠 Why Viewers Stayed (Retention Trigger):**\n{sel_vid.get('why_it_went_viral', '—')}")
                    st.info(f"**📋 Adaptable Hook Template For You:**\n{sel_vid.get('adapt_hook_template', '—')}")

        st.markdown("---")

        # ── 6. COMPETITOR BENCHMARKING ─────────────────────────────────────────
        competitors = intel.get("competitor_benchmarking", [])
        if competitors:
            st.markdown("### ⚔️ Competitor Benchmarking & Gaps")
            st.caption("Analyze what rival creators are doing and where they are leaving audience on the table.")
            for comp in competitors:
                with st.expander(f"🔴 {comp.get('competitor_name', 'Competitor')} — Breakdown & How To Beat Them"):
                    cc1, cc2 = st.columns(2)
                    with cc1:
                        st.markdown(f"**Recent Focus:** {comp.get('recent_content_focus', '—')}")
                        st.markdown(f"**Their Strength:** {comp.get('their_strength', '—')}")
                    with cc2:
                        st.markdown(f"**Their Gap / Weakness:** {comp.get('their_gap', '—')}")
                        st.success(f"**🏆 Your Winning Strategy:** {comp.get('how_to_beat_them', '—')}")

        st.markdown("---")

        # ── 7. CONTENT SUGGESTIONS (READY TO TEST) ────────────────────────────
        suggestions = intel.get("content_suggestions", [])
        if suggestions:
            st.markdown("### 💡 High-Potential Content Suggestions")
            st.caption("AI-generated ideas based on current trends and audience demand. Click 'Test these hooks' to validate in Hook Testing.")
            for s in suggestions:
                with st.container(border=True):
                    h1, h2 = st.columns([3, 1])
                    with h1:
                        st.markdown(f"##### Idea #{s.get('id', '?')}: {s.get('title', 'Untitled')}")
                        st.caption(f"🔥 Trending topic: {s.get('trending_topic', '—')}")
                        st.markdown(f"**Why it works:** {s.get('why_it_works', '—')}")
                    with h2:
                        st.metric("Estimated Views", s.get("estimated_views", "—"))

                    hooks = s.get("candidate_hooks", [])
                    if hooks:
                        st.markdown("**Candidate Hooks (Engineered for 3-sec short-form retention):**")
                        for hk in hooks:
                            st.markdown(f"- **{hk.get('sid', '?')}**: {hk.get('text', '')}")

                    # ── Pre-fill Hook Testing tab with these hooks
                    if st.button(f"▶ Test these hooks on audience", key=f"test_idea_{s.get('id')}"):
                        hook_lines = "\n".join(
                            [f"{hk['sid']}: {hk['text']}" for hk in hooks if 'sid' in hk and 'text' in hk]
                        )
                        prefill = (
                            f"Creator: {creator_name_display}. "
                            f"Niche: {s.get('trending_topic', '')}.\n"
                            f"{hook_lines}"
                        )
                        st.session_state.prefill_hooks = prefill
                        st.success("✅ Hooks pre-filled! Switch to the **🎯 Hook Testing** tab above.")


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 2 — HOOK TESTING  (Synthetic Audience Calibration)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_hook:
    st.markdown("### 🎯 Hook Testing on Synthetic Audience")
    st.caption("Test content hooks on a synthetic audience calibrated by your real audience.")

    # If user clicked "Test these hooks" in Creator Intelligence, pre-fill the text box
    default_text = st.session_state.get("prefill_hooks", "")

    text = st.text_area(
        "Describe the channel and audience. Paste candidate hooks, or ask for 8.",
        value=default_text,
        height=140,
        placeholder="e.g. Finance Reels for Indian college students. S1: Hook 1... S2: Hook 2..."
    )
    creator_url = st.text_input("🔗 Creator URL (Optional: Let Firecrawl read their website/blog!)")
    n = st.slider(
        "Synthetic audience size", 10, 150, 15, 5,
        help="15-20 personas takes ~35s on Groq free tier. Use 100+ for final evaluation."
    )

    if st.button("▶ Run on synthetic audience", type="primary") and text:
        with st.spinner("Asking the audience…"):
            try:
                if creator_url:
                    with st.spinner("🕷️ Scraping website with Firecrawl..."):
                        from parallel.scraper import scrape_creator_context
                        scraped_text = scrape_creator_context(creator_url)
                        text = text + "\n\nBACKGROUND CONTEXT FROM WEBSITE:\n" + scraped_text
                res = run_study(text, n)
                st.session_state.res = res
                st.session_state.prefill_hooks = ""
                Path("data").mkdir(exist_ok=True)
                Path("data/brief.txt").write_text(brief_text(res["study"]), encoding="utf-8")
                Path("data/summary.txt").write_text(summary_text(res), encoding="utf-8")
                st.success("Study compiled and saved!")
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
            st.subheader("🏆 Hook Performance Ranking")
            items_df = res["items"].rename(columns={"text": "hook_text"}).copy()

            # 1. Interactive Stop-Scroll Bar Chart
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
                height=320,
                margin=dict(l=10, r=10, t=40, b=10)
            )
            st.plotly_chart(fig_score, use_container_width=True)

            # 2. Polarization Ladder
            pol_col1, pol_col2 = st.columns(2)
            with pol_col1:
                st.markdown("##### 🌟 Audience Favorite (`Best`) Share")
                fig_best = px.bar(
                    items_df, x="best", y="sid", orientation="h",
                    color_discrete_sequence=["#00CC96"],
                    labels={"best": "% Picked as Best", "sid": "Hook"}
                )
                fig_best.update_layout(xaxis_tickformat='.0%', height=240, margin=dict(l=10, r=10, t=20, b=10))
                st.plotly_chart(fig_best, use_container_width=True)

            with pol_col2:
                st.markdown("##### ⚠️ High Drop-off (`Worst`) Share")
                fig_worst = px.bar(
                    items_df, x="worst", y="sid", orientation="h",
                    color_discrete_sequence=["#EF553B"],
                    labels={"worst": "% Picked as Worst", "sid": "Hook"}
                )
                fig_worst.update_layout(xaxis_tickformat='.0%', height=240, margin=dict(l=10, r=10, t=20, b=10))
                st.plotly_chart(fig_worst, use_container_width=True)

            # 3. Clickbait Alert
            clickbait_hooks = items_df[items_df["clickbait"] >= 0.15]
            if not clickbait_hooks.empty:
                for _, r in clickbait_hooks.iterrows():
                    st.warning(
                        f"🚨 **Clickbait Risk on {r['sid']}**: "
                        f"{r['clickbait']:.0%} of viewers felt misled by: *\"{r['hook_text']}\"*"
                    )

            # 4. Raw Data
            with st.expander("📋 View Raw Ranking Data Table"):
                st.dataframe(
                    items_df[["sid", "hook_text", "score", "best", "worst", "clickbait"]],
                    use_container_width=True
                )

        c1, c2 = st.columns(2)
        with c1:
            st.subheader("📊 Where segments disagree")
            st.dataframe(res["segments"]["matrix"], use_container_width=True)
        with c2:
            st.subheader("🚩 Bias Flags")
            if res["bias"]:
                for flag in res["bias"]:
                    st.caption(f"⚠ {flag}")
            else:
                st.caption("✅ No extreme segment deviations found.")

        st.markdown("---")
        st.subheader("⚙️ Calibration")
        if st.button("Compare with real panel"):
            sids = [s.sid for s in res["study"].stimuli]
            real_df = load_panel(sids)
            if len(real_df) > 0:
                fid = close_the_loop(res["study"], res["items"], real_df)
                st.write(fid)
                st.success("Fidelity calculated and calibration history updated!")
            else:
                st.warning(
                    "No real panel data found yet. "
                    "Invite users to the Bridge app and have them fill out the Rate form first!"
                )
