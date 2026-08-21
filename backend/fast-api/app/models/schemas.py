from pydantic import BaseModel
from typing import List, Dict, Optional

class StageImage(BaseModel):
    title: str
    description: str
    image_base64: str

class PipelineResult(BaseModel):
    stages: List[StageImage]
    original_size: List[int]
    crop_bounds: List[int]
    max_loc: List[int]

class ScreeningResponse(BaseModel):
    filename: str
    prediction: str  # "Glaucoma" or "Normal"
    glaucoma_probability: float
    confidence_percentage: float
    is_pathological: bool
    reduced_features: List[float]
    rule_firing_strengths: List[float]
    membership_degrees: List[List[float]]
    pipeline: PipelineResult
    recommendation: str
    cup_to_disc_ratio_summary: str

class BenchmarkMetric(BaseModel):
    model: str
    auc: float
    accuracy: float
    sensitivity: float
    specificity: float
    ap: float

class ConfusionMatrixData(BaseModel):
    tn: int
    fp: int
    fn: int
    tp: int
    labels: List[str]

class AnalyticsResponse(BaseModel):
    metrics: List[BenchmarkMetric]
    confusion_matrix: ConfusionMatrixData
    dataset_summary: List[Dict[str, str]]

class ReportRequest(BaseModel):
    prediction: Optional[str] = "Normal"
    glaucoma_probability: Optional[float] = 0.0
    confidence_percentage: Optional[float] = None
    is_pathological: Optional[bool] = None
    cup_to_disc_ratio_summary: Optional[str] = None
    recommendation: Optional[str] = None
    reduced_features: Optional[List[float]] = None
    rule_firing_strengths: Optional[List[float]] = None
    membership_degrees: Optional[List[List[float]]] = None
    patient_age: Optional[int] = None
    patient_notes: Optional[str] = None

class SourceChunk(BaseModel):
    title: str
    source: str
    chunk_index: int
    excerpt: str
    score: Optional[float] = None

class ClinicalReportResponse(BaseModel):
    prediction: str
    confidence_percentage: float
    report: str
    summary: str
    sources: List[SourceChunk]

class IngestResponse(BaseModel):
    filename: str
    chunks_ingested: int
    status: str
    message: str
