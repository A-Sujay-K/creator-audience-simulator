import streamlit as st
from pathlib import Path
from parallel.pipeline import run_study, brief_text, summary_text
from parallel.panel import load_panel
from parallel.fidelity import close_the_loop

st.set_page_config(page_title="Parallel for Creators", page_icon="⚡", layout="wide")
st.title("⚡ Parallel for Creators")
st.caption("Test content hooks on a synthetic audience calibrated by your real audience.")

text = st.text_area("Describe the channel and audience. Paste candidate hooks, or ask for 8.", height=140, placeholder="e.g. Finance Reels for Indian college students. S1: Hook 1... S2: Hook 2...")
creator_url = st.text_input("🔗 Creator URL (Optional: Let Firecrawl read their website/blog!)")
n = st.slider("Synthetic audience size", 50, 300, 150, 25)

if st.button("▶ Run on synthetic audience", type="primary") and text:
    with st.spinner("Asking the audience… (Takes ~20 seconds)"):
        try:
            res = run_study(text, n)
            # If the user typed a URL, scrape it before running the AI!
            if creator_url:
                with st.spinner("🕷️ Scraping website with Firecrawl..."):
                    from parallel.scraper import scrape_creator_context
                    scraped_text = scrape_creator_context(creator_url)
                    # Inject the scraped knowledge into the AI's instructions
                    text = text + "\n\nBACKGROUND CONTEXT FROM WEBSITE:\n" + scraped_text
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
        st.subheader("🏆 Hook Ranking")
        st.dataframe(res["items"][["sid", "text", "score", "best", "worst", "clickbait"]], use_container_width=True)

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
