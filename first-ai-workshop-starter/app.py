"""Optional UI for the Study Buddy RAG app.

Run:  streamlit run app.py
"""
import streamlit as st

st.set_page_config(page_title="Study Buddy", page_icon="books")


@st.cache_resource(show_spinner="Indexing your notes...")
def load_app():
    # Imported inside the cached function so the index is built ONCE, not on
    # every keystroke. Streamlit re-runs this whole script constantly.
    import rag
    return rag


rag = load_app()

st.title("Study Buddy")
st.caption("Answers only from the files in notes/ - with sources, "
           "or an honest 'Not in my notes.'")

q = st.text_input("Ask a question about your notes")

if q:
    with st.spinner("Searching your notes..."):
        answer, hits = rag.ask(q)

    st.markdown(answer)

    if hits:
        with st.expander(f"Sources used ({len(hits)})"):
            for h, score in hits:
                st.markdown(f"**{h['source']}** &nbsp; `similarity {score:.2f}`")
                st.caption(h["text"][:400] + "...")
    else:
        st.info("Nothing in your notes cleared the similarity floor, "
                "so the app refused rather than guessed.")
