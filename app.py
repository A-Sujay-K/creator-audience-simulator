import streamlit as st
from pathlib import Path
import plotly.express as px
from parallel.pipeline import run_study, brief_text, summary_text
from parallel.panel import load_panel
from parallel.fidelity import close_the_loop

st.set_page_config(page_title="Parallel for Creators", page_icon="⚡", layout="wide")
st.title("⚡ Parallel for Creators")
st.caption("Your AI-powered content intelligence studio.")

# ─── TOP-LEVEL TABS ──────────────────────────────────────────────────────────
tab_intel, tab_hook = st.tabs(["🧠 Creator Intelligence", "🎯 Hook Testing"])


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 1 — CREATOR INTELLIGENCE  (Main Feature)
# ═══════════════════════════════════════════════════════════════════════════════
with tab_intel:
    st.markdown("### 🔍 Discover any creator's landscape")
    st.caption(
        "Enter a creator's name. We'll scan the internet for their accounts, "
        "trending topics in their niche, competitors, and generate 4 ready-to-test content ideas."
    )

    col_a, col_b = st.columns([2, 1])
    with col_a:
        creator_name = st.text_input(
            "Creator Name",
            placeholder="e.g. CarryMinati, MrBeast, Ashish Chanchlani"
        )
    with col_b:
        creator_niche = st.text_input(
            "Niche (optional)",
            placeholder="e.g. Comedy Shorts, Finance, Gaming"
        )

    run_intel = st.button("🚀 Discover & Analyse", type="primary", key="intel_btn")

    if run_intel and creator_name.strip():
        with st.spinner(f"🌐 Scanning {creator_name}'s digital footprint..."):
            try:
                from parallel.intelligence import generate_creator_intelligence
                intel = generate_creator_intelligence(creator_name.strip(), creator_niche.strip())
                st.session_state.intel = intel
                st.session_state.intel_name = creator_name.strip()
            except Exception as e:
                st.error(f"Intelligence engine error: {e}")
    elif run_intel:
        st.warning("Please enter a creator name.")

    intel = st.session_state.get("intel")
    if intel:
        creator_name_display = st.session_state.get("intel_name", "Creator")
        st.markdown("---")

        # ── CREATOR PROFILE CARD ──────────────────────────────────────────────
        profile = intel.get("creator_profile", {})
        if profile:
            st.markdown("#### 👤 Creator Profile")
            p1, p2, p3 = st.columns(3)
            p1.metric("Core Niche", profile.get("core_niche", "—"))
            p2.metric("Tone & Style", profile.get("tone_and_style", "—"))
            p3.metric("Audience Vibe", profile.get("audience_vibe", "—"))

            accounts = profile.get("discovered_accounts", [])
            if accounts:
                st.markdown("**Discovered Accounts & Links:**")
                for acc in accounts:
                    platform = acc.get("platform", "Other")
                    title = acc.get("title", platform)
                    url = acc.get("url", "")
                    if url:
                        st.markdown(f"- [{platform}] **[{title}]({url})**")
                    else:
                        st.markdown(f"- [{platform}] {title}")

        # ── TRENDING LANDSCAPE ────────────────────────────────────────────────
        trends = intel.get("trending_landscape", {})
        if trends:
            st.markdown("---")
            st.markdown("#### 📈 Trending Landscape")
            trend_list = trends.get("current_trends_in_niche", [])
            if trend_list:
                st.markdown("**Hot topics right now:**")
                for t in trend_list:
                    st.markdown(f"- {t}")
            audience_want = trends.get("what_audience_wants_now", "")
            if audience_want:
                st.info(f"🎯 **What the audience wants now:** {audience_want}")

        # ── COMPETITOR BENCHMARKING ───────────────────────────────────────────
        competitors = intel.get("competitor_benchmarking", [])
        if competitors:
            st.markdown("---")
            st.markdown("#### ⚔️ Competitor Benchmarking")
            for comp in competitors:
                with st.expander(f"🔴 {comp.get('competitor_name', 'Competitor')} — How to beat them"):
                    cc1, cc2 = st.columns(2)
                    with cc1:
                        st.markdown(f"**Recent Focus:** {comp.get('recent_content_focus', '—')}")
                        st.markdown(f"**Their Strength:** {comp.get('their_strength', '—')}")
                    with cc2:
                        st.markdown(f"**Their Gap:** {comp.get('their_gap', '—')}")
                        st.success(f"**Your Move:** {comp.get('how_to_beat_them', '—')}")

        # ── CONTENT SUGGESTIONS ───────────────────────────────────────────────
        suggestions = intel.get("content_suggestions", [])
        if suggestions:
            st.markdown("---")
            st.markdown("#### 💡 Content Suggestions (Ready to Test)")
            for s in suggestions:
                sid_label = f"Idea #{s.get('id', '?')}"
                with st.container(border=True):
                    h1, h2 = st.columns([3, 1])
                    with h1:
                        st.markdown(f"##### {s.get('title', 'Untitled')}")
                        st.caption(f"🔥 Trending topic: {s.get('trending_topic', '—')}")
                        st.markdown(f"**Why it works:** {s.get('why_it_works', '—')}")
                    with h2:
                        st.metric("Estimated Views", s.get("estimated_views", "—"))

                    hooks = s.get("candidate_hooks", [])
                    if hooks:
                        st.markdown("**Candidate Hooks (AI-generated for 3-sec short-form):**")
                        for hk in hooks:
                            st.markdown(f"- **{hk.get('sid', '?')}**: {hk.get('text', '')}")

                    # ── Pre-fill Hook Testing tab with these hooks
                    if st.button(f"▶ Test these hooks in Hook Testing", key=f"test_idea_{s.get('id')}"):
                        hook_lines = "\n".join(
                            [f"{hk['sid']}: {hk['text']}" for hk in hooks if 'sid' in hk and 'text' in hk]
                        )
                        prefill = (
                            f"Creator: {creator_name_display}. "
                            f"Niche: {s.get('trending_topic', '')}.\n"
                            f"{hook_lines}"
                        )
                        st.session_state.prefill_hooks = prefill
                        st.success("✅ Hooks pre-filled! Switch to the **🎯 Hook Testing** tab.")


# ═══════════════════════════════════════════════════════════════════════════════
#  TAB 2 — HOOK TESTING  (Side Feature)
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
                # Clear prefill so it doesn't re-appear on next run
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
