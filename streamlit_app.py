import streamlit as st
import streamlit.components.v1 as components

# Set page configuration for full layout
st.set_page_config(
    page_title="EcoTrace India - Carbon Footprint Tracker",
    page_icon="🌱",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# CSS injection to hide Streamlit default padding, headers, and footers
st.markdown("""
    <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .block-container {
            padding-top: 0rem;
            padding-bottom: 0rem;
            padding-left: 0rem;
            padding-right: 0rem;
        }
        iframe {
            display: block;
            border: none;
            width: 100% !important;
            height: calc(100vh - 10px) !important;
        }
    </style>
""", unsafe_allow_html=True)

# Read the HTML, CSS, and JS files, and compile them into a single self-contained document
def load_app():
    try:
        with open("index.html", "r", encoding="utf-8") as f:
            html = f.read()
        with open("styles.css", "r", encoding="utf-8") as f:
            css = f.read()
        with open("app.js", "r", encoding="utf-8") as f:
            js = f.read()
            
        # Injects the compiled stylesheet and javascript
        html_compiled = html.replace(
            '<link rel="stylesheet" href="styles.css">',
            f'<style>{css}</style>'
        )
        html_compiled = html_compiled.replace(
            '<script src="app.js"></script>',
            f'<script>{js}</script>'
        )
        return html_compiled
    except Exception as e:
        return f"<h3>Error compiling assets: {e}</h3>"

html_content = load_app()

# Render inside Streamlit component frame
components.html(html_content, height=900, scrolling=True)
