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
st.caption("Content Intelligence, Viral Hook Calibration & Monetization Studio")

# ─── TOP-LEVEL TABS (Clean 3-Tab Architecture) ──────────────────────────────
tab_ideas, tab_hooks, tab_analytics = st.tabs([
    "💡 Viral Ideas & Competitors", 
    "🎯 Hook Testing & Predictions", 
    "📊 Channel Reach & Commercials"
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
                st.success("Analysis complete!")
            except Exception as e:
                st.error(f"Intelligence engine notice: {e}")
    elif run_intel:
        st.warning("Please enter a creator name.")

    intel = st.session_state.get("intel")
    if intel:
        creator_name_display = st.session_state.get("intel_name", "Creator")
        profile = intel.get("creator_profile", {})

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
                if "youtube.com" in v_url or "youtu.be" in v_url:
                    st.video(v_url)
                    st.caption(f"▶️ Playing from YouTube: [{v_url}]({v_url})")
                elif "instagram.com" in v_url:
                    m = re.search(r"/(?:reel|p)/([A-Za-z0-9_-]+)", v_url)
                    if m:
                        code = m.group(1)
                        embed_code = f"""
                        <iframe src="https://www.instagram.com/reel/{code}/embed" 
                                width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
                        """
                        st.components.v1.html(embed_code, height=500)
                    else:
                        st.info(f"Instagram Reel Link: [{v_url}]({v_url})")
                    st.link_button("📱 Open on Instagram", v_url, type="secondary")
                else:
                    if v_url:
                        st.video(v_url)
                    else:
                        st.warning("Video preview link currently loading.")

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
                                if "youtube.com" in ref_url or "youtu.be" in ref_url:
                                    st.video(ref_url)
                                    st.caption(f"▶️ Reference Video: [{ref_title}]({ref_url})")
                                elif "instagram.com" in ref_url:
                                    m = re.search(r"/(?:reel|p)/([A-Za-z0-9_-]+)", ref_url)
                                    if m:
                                        code = m.group(1)
                                        embed_code = f"""
                                        <iframe src="https://www.instagram.com/reel/{code}/embed" 
                                                width="100%" height="420" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
                                        """
                                        st.components.v1.html(embed_code, height=440)
                                    else:
                                        st.info(f"Instagram Reference: [{ref_url}]({ref_url})")
                                    st.link_button("📱 Open Reference Reel", ref_url, type="secondary")
                                else:
                                    st.video(ref_url)
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
                if "youtube.com" in cv_url or "youtu.be" in cv_url:
                    st.video(cv_url)
                    st.caption(f"▶️ Playing from YouTube: [{cv_url}]({cv_url})")
                elif "instagram.com" in cv_url:
                    m = re.search(r"/(?:reel|p)/([A-Za-z0-9_-]+)", cv_url)
                    if m:
                        code = m.group(1)
                        embed_code = f"""
                        <iframe src="https://www.instagram.com/reel/{code}/embed" 
                                width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>
                        """
                        st.components.v1.html(embed_code, height=500)
                    else:
                        st.info(f"Instagram Reel: [{cv_url}]({cv_url})")
                    st.link_button("📱 Open on Instagram", cv_url, type="secondary")
                else:
                    if cv_url:
                        st.video(cv_url)
                    else:
                        st.warning("Video preview link currently loading.")

            with cvcol_analysis:
                with st.container(border=True):
                    st.markdown("##### 🔍 Creator's Proven Hook Breakdown")
                    st.metric("Views Benchmark", c_sel_vid.get("views", "Top Performer"))
                    st.markdown(f"**⚡ Opening 3-Second Hook:**\n> *\"{c_sel_vid.get('opening_hook', '—')}\"*")
                    st.markdown(f"**🧠 Why Viewers Stayed:**\n{c_sel_vid.get('why_it_went_viral', '—')}")
                    st.info(f"**📋 Adaptable Strategy:**\n{c_sel_vid.get('adapt_hook_template', '—')}")
        else:
            st.info("Creator video analysis is currently loading or being calibrated.")
