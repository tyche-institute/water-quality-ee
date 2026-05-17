# Speaker notes — Water Quality Compliance Estimator

Target length: ~5 minutes spoken (≈ 600–700 words). Each block is read while
the matching slide is shown.

---

## Slide 1 — Title

Hi, I'm Anton Sokolov. My final project for the Machine Learning course is a
**probabilistic risk estimator for water-quality compliance** in Estonia.
The data comes from Terviseamet's open XML feed; the goal is a binary
classifier that decides whether a single laboratory probe matches the official
health norm. The model is already in production at **h2oatlas.ee**, where it
runs alongside the official label as a second opinion. I'll spend the next
five minutes on data, methodology, results, and what we learned.

## Slide 2 — Problem & Data

We pulled probes from four domains — bathing waters, public water-supply,
swimming pools and SPAs, and drinking-water sources — for the years 2021 to
2026. After cleaning and de-duplication we have just over **69 000 probes**.
The class balance is heavily skewed: about **87% pass, 13% violate**. The
priority metric for us is **recall on the violation class**: a false negative
means we tell the user "the water is fine" when in fact it is not, which is a
much worse failure than a false alarm. One subtle data issue worth noting:
Terviseamet renames the same physical site between yearly XML files, so we
introduced a normalised `location_key` to avoid double-counting.

## Slide 3 — Methodology

The pipeline is six numbered notebooks. Feature engineering produces 70
columns: raw measurements, ratio-to-norm features, missing-value indicators,
month and season, plus one-hot domain and county — fitted on train only to
avoid leakage. We compared four classifiers: Logistic Regression as a
baseline, Random Forest, Gradient Boosting, and LightGBM. We deliberately
did **not** use SMOTE; instead we relied on `class_weight="balanced"` and
threshold tuning on the precision-recall curve, which keeps the calibrated
probabilities meaningful. We validated both with a random 80/20 split and a
five-fold time-series cross-validation, and the metrics agreed within a few
points, so the model isn't simply memorising the calendar year.

## Slide 4 — Results

LightGBM came out on top: ROC-AUC of **0.995**, F1 on the violation class of
**0.92**. Recall at the default threshold is 0.95; if we tighten the
threshold, Gradient Boosting is competitive and even gives a slightly higher
recall, but at lower precision. The honest reading is that **LightGBM gives
the best precision–recall trade-off**, and the threshold lets us slide along
that curve without retraining. The Logistic Regression baseline is far below
— that gap shows the problem really does benefit from non-linear models and
feature interactions.

## Slide 5 — Interpretation

SHAP analysis on a 800-sample slice ranks **iron-missing, combined chlorine,
free chlorine, colonies-at-37C-missing, and pH-missing** as the top five
drivers. The headline here is that the **missing-value indicators dominate**.
That sounds counter-intuitive, but it isn't: which parameters are measured at
all tells the model a lot about the *type* of probe — pool chemistry, drinking
water, or open bathing water — and that type carries a different baseline
risk. Raw chemistry features like coliforms, pH, and oxidisability follow.
The right-hand calibration plot shows that all four models track the
ideal diagonal closely, so the predicted probabilities are trustworthy enough
to expose on the public map.

## Slide 6 — Limitations & Production

Three honest limitations. **First**, the target label is largely a function
of the same input parameters, so an AUC above 0.99 partly reflects the
**structure of the task**, not a unique prediction ability. **Second**, our
Phase-10 audit found about 3% of probes where the official verdict is
"violation" but no published parameter exceeds the norm — there is data we
don't see. **Third**, while validating, we found that our pool-water
chlorine norms were wrong; correcting them lifted the model's agreement with
the official label by 9 points. The production map at h2oatlas.ee carries
this disclaimer prominently: it does not replace official assessment.

## Slide 7 — Lessons Learned

Our supervisor warned us that data work, class imbalance, and multi-model
comparison would take longer than we'd planned. He was right. Three things
we'd do exactly the same again. **One**, we scoped progressively — two
domains first, four only after the pipeline stabilised. **Two**, we added a
data-quality audit phase only after the first model surprised us — and that
audit caught real bugs. **Three**, we kept the imbalance handling
conservative: weights and thresholds, not synthetic oversampling, so the
calibrated probabilities you see on the map actually mean what they say.
Thank you — happy to take questions.
