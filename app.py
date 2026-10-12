import streamlit as st
from pathlib import Path
import plotly.express as px
from parallel.pipeline import run_study, brief_text, summary_text
from parallel.panel import load_panel
from parallel.fidelity import close_the_loop

st.set_page_config(page_title="Parallel for Creators", page_icon="⚡", layout="wide")
st.title("⚡ Parallel for Creators")
st.caption("Test content hooks on a synthetic audience calibrated by your real audience.")

text = st.text_area("Describe the channel and audience. Paste candidate hooks, or ask for 8.", height=140, placeholder="e.g. Finance Reels for Indian college students. S1: Hook 1... S2: Hook 2...")
creator_url = st.text_input("🔗 Creator URL (Optional: Let Firecrawl read their website/blog!)")
n = st.slider("Synthetic audience size", 10, 150, 15, 5, help="15-20 personas takes ~35s on Groq free tier. Use 100+ for final evaluation.")

if st.button("▶ Run on synthetic audience", type="primary") and text:
    with st.spinner("Asking the audience…"):
        try:
            # If the user typed a URL, scrape it before running the AI!
            if creator_url:
                with st.spinner("🕷️ Scraping website with Firecrawl..."):
                    from parallel.scraper import scrape_creator_context
                    scraped_text = scrape_creator_context(creator_url)
                    # Inject the scraped knowledge into the AI's instructions
                    text = text + "\n\nBACKGROUND CONTEXT FROM WEBSITE:\n" + scraped_text
            res = run_study(text, n)
            st.session_state.res = res
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

        # 2. Polarization Ladder: Audience Best vs. Worst Choice
        pol_col1, pol_col2 = st.columns(2)
        with pol_col1:
            st.markdown("##### 🌟 Audience Favorite (`Best`) Share")
            fig_best = px.bar(
                items_df,
                x="best",
                y="sid",
                orientation="h",
                color_discrete_sequence=["#00CC96"],
                labels={"best": "% Picked as Best", "sid": "Hook"}
            )
            fig_best.update_layout(xaxis_tickformat='.0%', height=240, margin=dict(l=10, r=10, t=20, b=10))
            st.plotly_chart(fig_best, use_container_width=True)

        with pol_col2:
            st.markdown("##### ⚠️ High Drop-off (`Worst`) Share")
            fig_worst = px.bar(
                items_df,
                x="worst",
                y="sid",
                orientation="h",
                color_discrete_sequence=["#EF553B"],
                labels={"worst": "% Picked as Worst", "sid": "Hook"}
            )
            fig_worst.update_layout(xaxis_tickformat='.0%', height=240, margin=dict(l=10, r=10, t=20, b=10))
            st.plotly_chart(fig_worst, use_container_width=True)

        # 3. Clickbait Safety Alert Banner
        clickbait_hooks = items_df[items_df["clickbait"] >= 0.15]
        if not clickbait_hooks.empty:
            for _, r in clickbait_hooks.iterrows():
                st.warning(f"🚨 **Clickbait Risk on {r['sid']}**: {r['clickbait']:.0%} of viewers felt misled by: *\"{r['hook_text']}\"*")

        # 4. Raw Data Table in an Expander
        with st.expander("📋 View Raw Ranking Data Table"):
            st.dataframe(items_df[["sid", "hook_text", "score", "best", "worst", "clickbait"]], use_container_width=True)

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
            st.warning("No real panel data found yet. Invite users to the Bridge app and have them fill out the Rate form first!")
