# Polygenic Risk Score Calculator
# Clinical-grade PRS computation using PGSCatalog validated scores

from .pgscatalog import (
    get_score_metadata,
    download_scoring_file,
    parse_scoring_file,
    load_scores_for_disease,
    DISEASE_CATALOG,
)
from .populations import (
    get_population_params,
    get_risk_category,
    POPULATION_PARAMS,
    RISK_THRESHOLDS,
)

__version__ = "0.1.0"
__all__ = [
    "get_score_metadata",
    "download_scoring_file",
    "parse_scoring_file",
    "load_scores_for_disease",
    "DISEASE_CATALOG",
    "get_population_params",
    "get_risk_category",
    "POPULATION_PARAMS",
    "RISK_THRESHOLDS",
]
