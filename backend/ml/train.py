import json
import numpy as np
from pathlib import Path
import joblib

from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

from backend.ml.dataset import load_dataset, export_dataset_to_csv
from backend.ml.preprocess import preprocess_message
from backend.config import MODELS_DIR, MODEL_PATH, VECTORIZER_PATH, METRICS_PATH

def train_and_evaluate():
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Load dataset
    raw_data = load_dataset()
    export_dataset_to_csv(MODELS_DIR / "cybersathi_dataset.csv")
    
    texts = [item["text"] for item in raw_data]
    labels = np.array([item["label"] for item in raw_data])
    
    # 2. Preprocess texts using our NLP pipeline
    processed_texts = [preprocess_message(t) for t in texts]
    
    # 3. Stratified Train / Test split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        processed_texts, labels, test_size=0.25, random_state=42, stratify=labels
    )
    
    # 4. Feature Extraction Comparison: TF-IDF vs Bag-of-Words
    tfidf_vectorizer = TfidfVectorizer(
        ngram_range=(1, 2),
        min_df=1,
        sublinear_tf=True
    )
    bow_vectorizer = CountVectorizer(
        ngram_range=(1, 2),
        min_df=1
    )
    
    # Fit vectorizers
    X_train_tfidf = tfidf_vectorizer.fit_transform(X_train_raw)
    X_test_tfidf = tfidf_vectorizer.transform(X_test_raw)
    
    X_train_bow = bow_vectorizer.fit_transform(X_train_raw)
    X_test_bow = bow_vectorizer.transform(X_test_raw)
    
    results = {}
    
    # Models to train & compare
    classifiers = {
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.5),
        "Logistic Regression": LogisticRegression(C=1.0, max_iter=200, random_state=42),
        "Support Vector Machine": SVC(C=1.0, kernel='linear', probability=True, random_state=42)
    }
    
    # Evaluation on both TF-IDF and BoW
    for feat_name, X_tr, X_te in [("TF-IDF", X_train_tfidf, X_test_tfidf), ("Bag-of-Words", X_train_bow, X_test_bow)]:
        results[feat_name] = {}
        for name, clf in classifiers.items():
            clf_copy = joblib.load(joblib.dump(clf, "/tmp/clf_tmp.pkl")[0])  # clone
            clf_copy.fit(X_tr, y_train)
            y_pred = clf_copy.predict(X_te)
            
            acc = float(accuracy_score(y_test, y_pred))
            prec = float(precision_score(y_test, y_pred, zero_division=0))
            rec = float(recall_score(y_test, y_pred, zero_division=0))
            f1 = float(f1_score(y_test, y_pred, zero_division=0))
            cm = confusion_matrix(y_test, y_pred).tolist()
            
            results[feat_name][name] = {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "confusion_matrix": cm,  # [[TN, FP], [FN, TP]]
                "true_negatives": cm[0][0] if len(cm) > 1 else 0,
                "false_positives": cm[0][1] if len(cm) > 1 else 0,
                "false_negatives": cm[1][0] if len(cm) > 1 else 0,
                "true_positives": cm[1][1] if len(cm) > 1 else 0,
            }
            print(f"[{feat_name}] {name:25} -> Acc: {acc:.4f}, Prec: {prec:.4f}, Rec: {rec:.4f}, F1: {f1:.4f}")
    
    # 5. Build and train Ensemble Model using Soft Voting
    mnb = MultinomialNB(alpha=0.5)
    lr = LogisticRegression(C=1.0, max_iter=200, random_state=42)
    svm = SVC(C=1.0, kernel='linear', probability=True, random_state=42)
    
    ensemble_clf = VotingClassifier(
        estimators=[
            ('mnb', mnb),
            ('lr', lr),
            ('svm', svm)
        ],
        voting='soft',
        weights=[1.0, 1.2, 1.2]
    )
    
    # Train ensemble on TF-IDF (typically superior for sparse SMS/email text)
    ensemble_clf.fit(X_train_tfidf, y_train)
    ens_pred = ensemble_clf.predict(X_test_tfidf)
    
    ens_acc = float(accuracy_score(y_test, ens_pred))
    ens_prec = float(precision_score(y_test, ens_pred, zero_division=0))
    ens_rec = float(recall_score(y_test, ens_pred, zero_division=0))
    ens_f1 = float(f1_score(y_test, ens_pred, zero_division=0))
    ens_cm = confusion_matrix(y_test, ens_pred).tolist()
    
    results["TF-IDF"]["Voting Ensemble (MNB+LR+SVM)"] = {
        "accuracy": round(ens_acc, 4),
        "precision": round(ens_prec, 4),
        "recall": round(ens_rec, 4),
        "f1_score": round(ens_f1, 4),
        "confusion_matrix": ens_cm,
        "true_negatives": ens_cm[0][0] if len(ens_cm) > 1 else 0,
        "false_positives": ens_cm[0][1] if len(ens_cm) > 1 else 0,
        "false_negatives": ens_cm[1][0] if len(ens_cm) > 1 else 0,
        "true_positives": ens_cm[1][1] if len(ens_cm) > 1 else 0,
    }
    print(f"[TF-IDF] {'Voting Ensemble':25} -> Acc: {ens_acc:.4f}, Prec: {ens_prec:.4f}, Rec: {ens_rec:.4f}, F1: {ens_f1:.4f}")
    
    # 6. Fit Final Model on Full Dataset for Production Serving
    X_full_tfidf = tfidf_vectorizer.fit_transform(processed_texts)
    ensemble_clf.fit(X_full_tfidf, labels)
    
    # 7. Save Artifacts
    joblib.dump(ensemble_clf, MODEL_PATH)
    joblib.dump(tfidf_vectorizer, VECTORIZER_PATH)
    
    metrics_summary = {
        "dataset_size": len(raw_data),
        "train_size": len(X_train_raw),
        "test_size": len(X_test_raw),
        "classes": {"0": "Legitimate / Safe", "1": "Fraud / Suspicious"},
        "comparisons": results,
        "best_model": "Voting Ensemble (MNB + LR + SVM) on TF-IDF",
        "advisory": "Evaluation performed on labelled benchmark dataset. Real-world fraud tactics evolve; continuous auditing and user education remain crucial."
    }
    
    with open(METRICS_PATH, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    
    print(f"\n[+] Model saved to: {MODEL_PATH}")
    print(f"[+] Vectorizer saved to: {VECTORIZER_PATH}")
    print(f"[+] Metrics written to: {METRICS_PATH}")
    return metrics_summary

if __name__ == "__main__":
    train_and_evaluate()
