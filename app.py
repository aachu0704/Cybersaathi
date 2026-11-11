"""SentiVoice – Speech Recognition and Emotion Analyzer

A beginner-friendly Streamlit web application that records speech, transcribes
it to text, and performs sentiment and emotion analysis with interactive charts.
"""

from datetime import datetime
from typing import Any, Dict, List

import pandas as pd
import streamlit as st

# Import core analytical modules from src/
from src.emotion import detect_emotions, get_classifier
from src.sentiment import analyze_sentiment
from src.speech_to_text import record_audio, transcribe_audio

# --- Page Configuration ---
st.set_page_config(
    page_title="SentiVoice – Speech & Emotion Analyzer",
    page_icon="🎙️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS for polished, beginner-friendly styling
st.markdown(
    """
    <style>
    .main-title {
        font-size: 2.3rem;
        font-weight: 700;
        color: #1E3A8A;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #4B5563;
        margin-bottom: 1.5rem;
    }
    .result-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 1.2rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }
    .text-display {
        font-size: 1.25rem;
        font-weight: 500;
        color: #0F172A;
        line-height: 1.5;
    }
    .metric-badge {
        font-weight: 600;
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        display: inline-block;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# --- Cache Heavy Resources ---
@st.cache_resource(show_spinner="⏳ Loading lightweight Emotion Transformer model...")
def load_cached_emotion_model():
    """Preload and cache the Hugging Face emotion classifier."""
    return get_classifier()


# Ensure model is ready in cache
try:
    load_cached_emotion_model()
except Exception as model_init_err:
    st.sidebar.warning(f"Note: Model will download on first run ({model_init_err})")


# --- Session State Initialization ---
if "history" not in st.session_state:
    st.session_state.history: List[Dict[str, Any]] = []

if "latest_result" not in st.session_state:
    st.session_state.latest_result = None

if "last_recorded_audio" not in st.session_state:
    st.session_state.last_recorded_audio = None


# --- Helper to Process and Save Analysis ---
def process_analysis(text: str, source: str) -> Dict[str, Any]:
    """Run sentiment and emotion pipelines on input text and save to session history."""
    sentiment_res = analyze_sentiment(text)
    emotion_res = detect_emotions(text)

    record = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "source": source,
        "text": text,
        "sentiment": sentiment_res["label"],
        "sentiment_emoji": sentiment_res["emoji"],
        "sentiment_compound": sentiment_res["compound"],
        "sentiment_scores": sentiment_res["scores"],
        "emotion": emotion_res["top_emotion"],
        "emotion_emoji": emotion_res["top_emoji"],
        "emotion_confidence": emotion_res["confidence"],
        "emotion_distribution": emotion_res["distribution"],
    }

    # Save to history (most recent first)
    st.session_state.history.insert(0, record)
    st.session_state.latest_result = record
    return record


# --- Sidebar ---
with st.sidebar:
    st.title("⚙️ Controls & Settings")

    st.markdown("### 🎙️ Audio Settings")
    recording_duration = st.slider(
        "Recording Duration (seconds)",
        min_value=2,
        max_value=15,
        value=5,
        step=1,
        help="How many seconds to listen via microphone.",
    )
    sample_rate = st.selectbox(
        "Sampling Rate (Hz)",
        options=[16000, 22050, 44100],
        index=0,
        help="16000 Hz is recommended for optimal speech recognition.",
    )

    st.markdown("---")
    st.markdown("### ℹ️ About SentiVoice")
    st.markdown(
        """
        **SentiVoice** combines:
        - **Microphone Audio**: `sounddevice`
        - **Speech Recognition**: Google Speech API
        - **Sentiment Analysis**: NLTK VADER
        - **Emotion Detection**: Hugging Face DistilBERT
        """
    )

    st.markdown("---")
    if st.button("🗑️ Clear Analysis History", use_container_width=True):
        st.session_state.history = []
        st.session_state.latest_result = None
        st.session_state.last_recorded_audio = None
        st.success("History cleared!")
        st.rerun()


# --- Main Application Header ---
st.markdown('<div class="main-title">🎙️ SentiVoice</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="sub-title">Real-time Speech Recognition, Sentiment Analysis, and Emotion Detection</div>',
    unsafe_allow_html=True,
)

# --- Input Modes Tabs ---
tab_voice, tab_text = st.tabs(["🎙️ Record Voice", "✍️ Manual Text Input"])

# --- TAB 1: Voice Recording ---
with tab_voice:
    st.write(
        "Click the button below and speak into your microphone. Once recording stops, "
        "your voice will be automatically transcribed and analyzed."
    )

    col_btn, col_info = st.columns([1, 2])
    with col_btn:
        start_rec = st.button("🔴 Start Recording", type="primary", use_container_width=True)

    if start_rec:
        with st.spinner(f"🎙️ Listening... Recording for {recording_duration} seconds..."):
            audio_array, wav_bytes, rec_err = record_audio(
                duration=recording_duration,
                sample_rate=sample_rate,
            )

        if rec_err:
            st.error(f"❌ Recording Failed: {rec_err}")
        elif wav_bytes:
            st.session_state.last_recorded_audio = wav_bytes
            with st.spinner("🧠 Transcribing speech to text..."):
                transcribe_res = transcribe_audio(wav_bytes)

            if not transcribe_res["success"]:
                st.warning(f"⚠️ {transcribe_res['error']}")
            else:
                recognized_text = transcribe_res["text"]
                process_analysis(recognized_text, source="Microphone")
                st.success("✅ Speech successfully transcribed and analyzed!")

    # Display audio player if audio was recorded
    if st.session_state.last_recorded_audio:
        st.markdown("##### 🔊 Recorded Audio Playback")
        st.audio(st.session_state.last_recorded_audio, format="audio/wav")

# --- TAB 2: Manual Text Input ---
with tab_text:
    st.write("Type or paste any text to test sentiment and emotion analysis without a microphone.")

    # Quick test sample chips
    if "manual_text_value" not in st.session_state:
        st.session_state.manual_text_value = (
            "I am absolutely thrilled and overjoyed! We just won the first prize in the competition!"
        )

    st.markdown("**Quick Test Samples:**")
    sample_cols = st.columns(3)
    if sample_cols[0].button("😊 Joyful News", use_container_width=True):
        st.session_state.manual_text_value = (
            "I am absolutely thrilled and overjoyed! We just won the first prize in the competition!"
        )
    if sample_cols[1].button("😠 Frustrated Query", use_container_width=True):
        st.session_state.manual_text_value = (
            "I am so angry and annoyed. The order was delayed three times and customer service was unhelpful."
        )
    if sample_cols[2].button("😐 Neutral Update", use_container_width=True):
        st.session_state.manual_text_value = (
            "The meeting is scheduled for tomorrow afternoon at 2 PM in room 304."
        )

    user_text_input = st.text_area(
        "Enter text to analyze:",
        value=st.session_state.manual_text_value,
        height=100,
        placeholder="Type something here, e.g., 'I really appreciate all your help on this project!'",
    )

    if st.button("⚡ Analyze Text", type="primary"):
        if not user_text_input.strip():
            st.warning("Please enter some text before analyzing.")
        else:
            with st.spinner("Analyzing text sentiment and emotion..."):
                process_analysis(user_text_input.strip(), source="Manual Text")
            st.success("✅ Text analyzed successfully!")


# --- Results Section ---
latest = st.session_state.latest_result
if latest:
    st.markdown("---")
    st.subheader("🔍 Analysis Results")

    # Display recognized / input text card
    st.markdown(
        f"""
        <div class="result-card">
            <span style="font-size: 0.85rem; color: #64748B; text-transform: uppercase; font-weight: 600;">
                Input Text ({latest['source']})
            </span>
            <div class="text-display">"{latest['text']}"</div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Metrics row
    col_metric1, col_metric2, col_metric3 = st.columns(3)
    with col_metric1:
        st.metric(
            label="Sentiment",
            value=f"{latest['sentiment_emoji']} {latest['sentiment']}",
            delta=f"Compound: {latest['sentiment_compound']:+.2f}",
        )

    with col_metric2:
        st.metric(
            label="Detected Emotion",
            value=f"{latest['emotion_emoji']} {latest['emotion']}",
            delta=f"Confidence: {latest['emotion_confidence']}%",
        )

    with col_metric3:
        # Confidence interpretation
        top_conf = latest["emotion_confidence"]
        status_text = "High Confidence" if top_conf > 70 else ("Moderate" if top_conf > 40 else "Subtle")
        st.metric(
            label="Emotion Strength",
            value=status_text,
            delta=f"{top_conf}%",
        )

    # Detailed Charts
    st.markdown("#### 📊 Detailed Breakdown")
    chart_col1, chart_col2 = st.columns(2)

    with chart_col1:
        st.markdown("**Emotion Probability Distribution**")
        if latest["emotion_distribution"]:
            emotion_df = pd.DataFrame(
                list(latest["emotion_distribution"].items()),
                columns=["Emotion", "Probability"],
            ).sort_values(by="Probability", ascending=True)

            st.bar_chart(
                data=emotion_df.set_index("Emotion"),
                color="#3B82F6",
                use_container_width=True,
            )

    with chart_col2:
        st.markdown("**VADER Sentiment Polarity Breakdown**")
        scores = latest["sentiment_scores"]
        sentiment_df = pd.DataFrame(
            {
                "Component": ["Positive", "Neutral", "Negative"],
                "Proportion": [scores["pos"], scores["neu"], scores["neg"]],
            }
        )
        st.bar_chart(
            data=sentiment_df.set_index("Component"),
            color="#10B981",
            use_container_width=True,
        )


# --- Dashboard & Session History ---
if st.session_state.history:
    st.markdown("---")
    st.subheader("📜 Session Analysis History & Dashboard")

    total_count = len(st.session_state.history)
    history_df = pd.DataFrame(st.session_state.history)

    # Aggregate metrics
    summary_col1, summary_col2, summary_col3 = st.columns(3)
    with summary_col1:
        st.metric("Total Analyzed", total_count)

    with summary_col2:
        most_common_emotion = history_df["emotion"].mode()[0] if not history_df.empty else "N/A"
        st.metric("Most Frequent Emotion", most_common_emotion)

    with summary_col3:
        avg_sentiment = round(history_df["sentiment_compound"].mean(), 2) if not history_df.empty else 0.0
        sentiment_tone = "Positive" if avg_sentiment >= 0.05 else ("Negative" if avg_sentiment <= -0.05 else "Neutral")
        st.metric("Avg Sentiment Score", f"{avg_sentiment:+.2f} ({sentiment_tone})")

    # Display History Table
    display_table = history_df[
        ["timestamp", "source", "text", "sentiment", "sentiment_compound", "emotion", "emotion_confidence"]
    ].rename(
        columns={
            "timestamp": "Timestamp",
            "source": "Source",
            "text": "Text",
            "sentiment": "Sentiment",
            "sentiment_compound": "Compound Score",
            "emotion": "Emotion",
            "emotion_confidence": "Confidence (%)",
        }
    )

    st.dataframe(display_table, use_container_width=True)

    # Download button for CSV export
    csv_data = display_table.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="📥 Download History as CSV",
        data=csv_data,
        file_name=f"sentivoice_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
        mime="text/csv",
    )
